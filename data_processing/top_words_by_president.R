###############################################
#
#			Top 10 Words by President
#
###############################################

# libraries
library(tidytext)
library(lubridate)
library(dplyr)
library(tidyr)
library(tidyverse)

# read in data
inaugural_speeches <- read_csv('data/presidential_inaugural_speeches.csv')

# Unnest the text strings into a data frame of words and get top 20 for each president
speech_words <- inaugural_speeches %>%
select(president_name, speech_text) %>%
unnest_tokens(word, speech_text) %>% # split into individual words
anti_join(get_stopwords()) %>% # remove stop words like the, to, etc.
mutate(word_count = n_distinct(word)) %>% # count frequency of words by president
group_by(president_name, word) %>%
summarize(word_count = sum(word_count)) %>%
arrange(president_name, desc(word_count)) %>%
filter(row_number() <= 20)

# write csv
write.csv(speech_words, 'data/top_20_words_by_president.csv')