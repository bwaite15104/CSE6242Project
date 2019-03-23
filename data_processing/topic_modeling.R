###############################################
#
#            Speech Topic Analysis
#
###############################################

# libraries
library(tidytext)
library(lubridate)
library(dplyr)
library(tidyr)
library(tidyverse)
library(topicmodels)
library(ggplot2)

# list of every president
president_list <- c('GEORGE WASHINGTON', 'JOHN ADAMS', 'THOMAS JEFFERSON', 'JAMES MADISON', 'JAMES MONROE', 'JOHN QUINCY ADAMS', 'ANDREW JACKSON',
    'MARTIN VAN BUREN', 'WILLIAM HENRY HARRISON', 'JOHN TYLER', 'JAMES K. POLK', 'ZACHARY TAYLOR', 'MILLARD FILLMORE', 'FRANKLIN PIERCE', 'JAMES BUCHANAN',
    'ABRAHAM LINCOLN', 'ANDREW JOHNSON', 'ULYSSES S. GRANT', 'RUTHERFORD B. HAYES', 'JAMES A. GARFIELD', 'CHESTER A. ARTHUR', 'GROVER CLEVELAND',
    'BENJAMIN HARRISON', 'WILLIAM MCKINLEY', 'THEODORE ROOSEVELT', 'WILLIAM HOWARD TAFT', 'WOODROW WILSON', 'WARREN G. HARDING', 'CALVIN COOLIDGE',
    'HERBERT HOOVER', 'FRANKLIN D. ROOSEVELT', 'HARRY S. TRUMAN', 'DWIGHT D. EISENHOWER', 'JOHN F. KENNEDY', 'LYNDON B. JOHNSON', 'RICHARD NIXON',
    'GERALD R. FORD', 'JIMMY CARTER', 'RONALD REAGAN', 'GEORGE BUSH', 'WILLIAM J. CLINTON', 'GEORGE W. BUSH', 'BARACK OBAMA', 'DONALD J. TRUMP')

# read in data
all_speeches <- read_csv('data/all_presidential_speeches.csv') %>%
select(-X1) %>%
filter(president_name %in% president_list) %>% # filter to only presidents
mutate(speech_id = row_number())  # add speech index

# clean president names for consistency with other data
all_speeches$president_name[all_speeches$president_name=='DONALD J. TRUMP'] <- 'DONALD TRUMP'
all_speeches$president_name[all_speeches$president_name=='WILLIAM J. CLINTON'] <- 'BILL CLINTON'
all_speeches$president_name[all_speeches$president_name=='GERALD R. FORD'] <- 'GERALD FORD'


# build custom stop words
custom_stopwords <- data.frame(word = c("fellow", "power", "life", "every", "like", "upon", "thank", "oath", "must", "occasion",
    "within", "interest", "essential", "terms", "among", "need", "duties", "bring", "good", "whose", "existence",
    "less", "shall", "means", "single", "certain", "without", "things", "attempt", "establish", "cause", "find",
    "believe", "never", "long", "time", "want", "well", "blessings", "called", "just", "made", "duty", "rights",
    "best", "first", "character", "principles", "course", "always", "become", "together", "faith", "year", "come",
    "neighbors", "right", "great", "future", "past", "place", "know", "others", "ever", "today", "pledge", "sacrifice",
    "interests", "care", "chief", "confidence", "high", "hopes", "liberty", "necessary", "present", "proper", "faithful",
    "therefore", "maintain", "experience", "prosperity", "conduct", "fact", "peace", "nation", "citizen", "citizens",
    "people", "matters", "force", "thought", "full", "leave", "wish", "nations", "earth", "even", "honor", "mind",
    "purposes", "sentiment", "toward", "continued", "constitutional", "public", "office", "hope", "constitution",
    "government", "country", "states", "united", "nations", "congress", "obligations", "however", "remember",
    "justice", "progress", "freedom", "give", "history", "mankind", "self", "help", "laws", "another", "beginning",
    "still", "human", "common", "moral", "justice", "american", "national", "much", "president", "years", "many",
    "america", "birth", "grateful", "little", "better", "rather", "done", "meet", "spirit", "given", "whatever",
    "support", "state", "taken", "make", "rule", "service", "home", "serve", "free", "equal", "known", "powers",
    "system", "trust", "stand", "countrymen", "political", "land", "different", "strong", "unity", "lead", "strength",
    "words", "either", "question", "whole", "respect", "opinion", "measures", "wise", "functions", "greater", "general",
    "important", "civil", "view", "century", "happiness", "also", "purpose", "effort", "difficult", "large", "executive",
    "subject", "influence", "consideration", "efforts", "along", "change", "form", "require", "almighty", "responsibility",
    "clear", "longer", "born", "take", "whether", "seek", "rules", "individual", "administration", "accept", "reach",
    "standing", "asked", "invite", "affairs", "love", "preserved", "determination", "take", "union", "followed", "press",
    "circumstances", "portion", "objects", "nature", "live", "hands", "americans", "promise",  "destiny", "small",
    "condition", "none", "settled", "soon", "neither", "preservation", "sections", "placed", "ancient", "back", "beyond",
    "continue", "differences", "might", "perhaps", "period", "powerful", "governments", "since", "call", "found", "heart",
    "highest", "hold", "sense", "sufficient", "wisdom", "part", "true", "republic", "success", "discharge", "result",
    "constantly", "alone", "action", "preserve", "deeply", "considered", "honorable", "independent", "patriotism",
    "station", "virtue", "importance", "local", "institutions", "legislative", "policy", "problems", "merely", "lands",
    "face", "share", "providence", "views", "possible", "peculiar", "individuals", "regard", "ability", "strict",
    "society", "came", "look", "lives", "moment", "last", "accross", "balance", "hand", "hard", "keep", "makes", 
    "turn", "problems", "throughout", "election", "degree", "order", "encourage", "honesty", "necessity", "presence",
    "increasing", "knowledge", "accomplished", "determining", "example", "enlightened", "limits", "settlement",
    "conditions", "continent", "relations", "material", "bound", "divisions", "meaning", "party", "requires", "seem",
    "think", "times", "around", "friend", "friends", "god's", "instead", "join", "move", "peaceful", "independence",
    "various", "extent", "federal", "left", "promote", "appear", "decision", "voice", "practice", "washington", "body",
    "making", "half", "dream", "members", "almost", "basis", "equally", "benefits", "execute", "citizenship", "equality",
    "judgment", "control", "second", "though", "show", "difference", "body", "said", "nothing", "written", "belongs",
    "speak", "sincere", "deep", "humanity", "solemn", "heretofore", "liberal", "feel", "departments", "world", "simple",
    "weak", "standards", "depend", "special", "peoples", "needed", "plans", "permanent", "demands", "prevent", "something",
    "especially", "favored", "territory", "reasonable", "seeking", "fair", "principle", "direction", "position",
    "conviction", "obligation", "endeavor", "favor", "reason", "doubt", "greatest", "thus", "committed", "expected",
    "consequences", "senate", "house", "representatives", "divine", "elected", "prescribed", "faithfully", "exercise",
    "fathers", "measure", "surely", "development", "devotion", "ceremony", "courage", "define", "values", "nation's",
    "vice", "endure", "side", "rest", "places", "perform", "firm", "least", "carry", "private", "abuses", "truth",
    "task", "cooperation", "attention", "pursued", "felt", "internal", "friendly", "overruling", "seen", "friendship",
    "renewed", "ready", "intelligence", "acts", "hearts", "justly", "magistrate", "surest", "assurance", "expect",
    "object", "gratitude", "republican", "return", "otherwise", "fully", "directed", "events", "remain", "guidance",
    "sympathies", "everywhere", "recent", "vision", "understanding", "rewards", "reality", "millions", "group", 
    "blood", "follow", "conscience", "clearly", "instrument", "honest", "required", "determined", "sacred", "experiment",
    "vote", "south", "recommendations", "pecuniary", "north", "march", "foundation", "forms", "enable", "brief",
    "blessing", "avoid", "advantage", "away", "clearly", "limitation", "lasting", "comfort", "burdens", "burden",
    "honest", "passed", "world's", "advance", "personal", "already", "prosperous", "advance", "fail", "enough",
    "harmony", "obedience", "former", "execution", "entire", "councils", "concerns", "command", "assembled", "whilst",
    "particular", "humble", "heaven", "endanger", "actual", "official", "exists", "sure", "observe", "cherish", "assure",
    "work", "mean", "pride", "light", "demand", "responsibilities", "abandon", "limited", "temporary", "provide",
    "glory", "fall", "destruction", "flag", "perfect", "instance", "chosen", "advancement", "recommend", "qualifications",
    "department", "consistent", "communities", "advanced", "fear", "steps", "effect", "authority", "services",
    "often", "noble", "country's", "constant", "questions", "increase", "number", "desire", "express", "sentiments",
    "pledges", "magnitude", "expenditures", "value", "soil", "inhabitants", "extend", "struggle", "revolution",
    "forced", "provided", "wrong", "express", "established", "continuance", "consent", "told", "four", "tell", "tonight",
    "resume", "arrived", "madam", "speaker", "begin", "achieve", "applause", "tonight", "lady", "1930", "concepts", "essentials",
    "replied", "unlimited", "historic", "experimenting", "expedited", "1981", "gridiron", "digress", "mainspring", "reexamination",
    "equalizing", "accustomed", "actuated", "obeyed", "disposed", "intrusted", "scrupulously", "going", "rekindle", "processes",
    "thrust", "alter", "holt", "clipping", "bulletin"))


# Unnest the text strings into a data frame of words
speech_words <- all_speeches %>%
unnest_tokens(word, speech_text) %>% # split into individual words
anti_join(get_stopwords()) %>% # remove stop words like the, to, etc.
anti_join(custom_stopwords) %>% 
filter(nchar(word) > 3) %>%
filter(!grepl('[0-9]+', word)) %>%
count(speech_id, word) %>%
rename(word_count = n)

# cast to document term matrix
speech_dtm <- speech_words %>%
cast_dtm(speech_id, word, word_count)

# build model
speech_lda <- LDA(speech_dtm, k=10, control=list(seed=1234))

# tidy model
speech_lda_td <- tidy(speech_lda)

# get top 10 terms in each topic
top_terms <- speech_lda_td %>%
group_by(topic) %>%
arrange(topic, -beta) %>%
filter(row_number() <= 10) %>%
ungroup() 

# name topics
top_terms$topic[top_terms$topic==1] <- 'Government Policy'
top_terms$topic[top_terms$topic==2] <- 'Health and Welfare'
top_terms$topic[top_terms$topic==3] <- 'Terrorism'
top_terms$topic[top_terms$topic==4] <- 'Economy'
top_terms$topic[top_terms$topic==5] <- 'Education'
top_terms$topic[top_terms$topic==6] <- 'Family'
top_terms$topic[top_terms$topic==7] <- 'Unemployment'
top_terms$topic[top_terms$topic==8] <- 'Defense'
top_terms$topic[top_terms$topic==9] <- 'Foreign Relations'
top_terms$topic[top_terms$topic==10] <- 'National Emergency'

# plot topics and save file
png("presidential_topics.png")
theme_set(theme_bw())
topics_plot <- top_terms %>%
  mutate(term = reorder(term, beta)) %>%
  ggplot(aes(term, beta)) +
  geom_bar(stat = "identity") +
  coord_flip() +
  facet_wrap(~ topic, scales = "free") +
  theme(axis.text.x = element_text(size = 15, angle = 90, hjust = 1))
print(topics_plot)
dev.off()

# get topic distribution by document
speech_lda_gamma <- tidy(speech_lda, matrix="gamma")

# join back to presidents and get distribution of topics
president_topic_distribution <- all_speeches %>%
select(president_name, speech_type, speech_id) %>%
mutate(speech_id = as.character(speech_id)) %>%
inner_join(speech_lda_gamma, by=c("speech_id"="document")) %>%
select(president_name, topic, gamma) %>%
group_by(president_name, topic) %>%
summarize(gamma = sum(gamma))

president_gamma_total <- president_topic_distribution %>%
select(president_name, gamma) %>%
group_by(president_name) %>%
summarize(gamma_sum = sum(gamma))

president_topics_clean <- president_topic_distribution %>%
left_join(president_gamma_total, by="president_name") %>%
mutate(topic_percent = gamma / gamma_sum) %>%
select(president_name, topic, topic_percent)

# write csv
write.csv(president_topics_clean, 'data/presidential_topics.csv')


