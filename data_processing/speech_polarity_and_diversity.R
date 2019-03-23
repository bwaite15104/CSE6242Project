###############################################
#
#			Speech Sentiment Analysis
#
###############################################

# libraries
library(tidytext)
library(lubridate)
library(dplyr)
library(tidyr)
library(tidyverse)

# read in data
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
filter(president_name %in% president_list) 

# clean president names for consistency with other data
all_speeches$president_name[all_speeches$president_name=='DONALD J. TRUMP'] <- 'DONALD TRUMP'
all_speeches$president_name[all_speeches$president_name=='WILLIAM J. CLINTON'] <- 'BILL CLINTON'
all_speeches$president_name[all_speeches$president_name=='GERALD R. FORD'] <- 'GERALD FORD'

# Unnest the text strings into a data frame of words
speech_words <- all_speeches %>%
unnest_tokens(word, speech_text) %>% # split into individual words
anti_join(get_stopwords()) 

# get polarity sentiments of presidents
bing <- get_sentiments("bing")

speech_polarity_sentiment <- speech_words %>%
inner_join(bing) %>%
select(-word) %>%
count(president_name, speech_date, speech_type, sentiment) %>%
spread(sentiment, n) 

speech_polarity_sentiment$negative[is.na(speech_polarity_sentiment$negative)] <- 0
speech_polarity_sentiment$positive[is.na(speech_polarity_sentiment$positive)] <- 0

speech_polarity_sentiment <- speech_polarity_sentiment %>%
mutate(sentiment = positive - negative)

# get speech diversity
speech_diversity <- speech_words %>%
select(president_name, word) %>%
distinct() %>%
select(president_name) %>%
count(president_name) %>%
rename(speech_diversity = n)

# join dataframes for complete set
speech_data_clean <- speech_polarity_sentiment %>%
left_join(speech_diversity, by="president_name")

# summarize data for visualition
speech_data_summarize <- speech_data_clean %>%
select(president_name, negative, positive) %>%
group_by(president_name) %>%
summarize(negative = sum(negative),
		positive = sum(positive)) %>%
mutate(sentiment = positive - negative) %>%
left_join(speech_diversity, by="president_name")

# write csv
write.csv(speech_data_clean, 'data/speech_polarity_for_model.csv')
write.csv(speech_data_summarize, 'data/speech_polarity_and_diversity.csv')
