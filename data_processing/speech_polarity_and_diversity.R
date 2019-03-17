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

# read in data
inaugural_speeches <- read_csv('data/presidential_inaugural_speeches.csv')

# Unnest the text strings into a data frame of words
speech_words <- inaugural_speeches %>%
unnest_tokens(word, speech_text) %>% # split into individual words
anti_join(get_stopwords()) %>% # remove stop words like the, to, etc.
group_by(president_name, word) %>%
mutate(word_count = n_distinct(word)) %>% # count frequency of words by president
arrange(president_name, desc(word)) %>%
ungroup()


# get polarity sentiments of presidents
bing <- get_sentiments("bing")

speech_polarity_sentiment <- speech_words %>%
inner_join(bing) %>%
select(president_name, sentiment, word_count) %>%
group_by(president_name, sentiment) %>%
summarize(sentiment_count = sum(word_count)) %>%
spread(sentiment, sentiment_count) %>%
mutate(sentiment = positive - negative)

# get range of words used by presidents
speech_diversity_date <- speech_words %>%
select(president_name, speech_date) %>%
distinct() %>% 
group_by(president_name) %>%
slice(1) %>%
ungroup()

speech_diversity <- speech_words %>%
group_by(president_name) %>%
count() %>%
left_join(speech_diversity_date, by='president_name') %>%
mutate(speech_date = mdy(speech_date))

# join dataframes for complete set
speech_data_clean <- speech_diversity %>%
left_join(speech_polarity_sentiment, by="president_name") %>%
mutate(negative_ratio = negative/n)

# write csv
write.csv(speech_data_clean, 'data/speech_polarity_and_diversity.csv')
