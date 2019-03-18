
# -----------------------------------------------------------------
#                               Analysis set up
# -----------------------------------------------------------------

setwd("/Users/wwaite/Dev/gtech/CSE 6242/bwaite15104.github.io/analysis/")
setwd("/Users/wwaite/Dev/gtech/CSE 6242/bwaite15104.github.io/data/")

# Load libraries
library(ggplot2)
library(dplyr)
library(tidyr)
library(lubridate)

# Load datasets
approval <- tbl_df(read.csv('Presidential Approval Ratings.csv', stringsAsFactors = FALSE))
speech_sentiments <- tbl_df(read.csv('speech_polarity_and_diversity.csv', stringsAsFactors = FALSE))
presidents <- tbl_df(read.csv('president_terms.csv', stringsAsFactors = FALSE))

# -----------------------------------------------------------------
#                  Approval Rating Structure, Analysis + Vizz
# -----------------------------------------------------------------

# Fix data types
approval$Start.Date <- mdy(approval$Start.Date)
approval$End.Date <- mdy(approval$End.Date)

# Modify df and mutate
df_approve <- approval %>%
  rename(start_date = Start.Date,
         end_date = End.Date,
         unsure_noData = Unsure.NoData) %>%
  mutate(approval_rate = Approving / 100)

# Data checks
nrow(df_approve) # 4224 rows
table(df_approve$President) # 66% of the dataset is obama

# Visualize count of approval rating data points
df_approve %>%
  select(President) %>%
  group_by(President) %>%
  count() %>%
  rename(rating_count = n) %>%
  arrange(desc(rating_count)) %>%
  ggplot(aes(x = reorder(President, -rating_count), y = rating_count, fill = President)) +
  geom_bar(stat = 'identity') +
  geom_text(aes(label = rating_count),
            position = position_dodge(width = 1),
            hjust = -0.05, size = 5) +
  coord_flip() +
  theme(legend.position="none") +
  labs(x = 'President', 
       y = 'Approval Rating Data Point Count', 
       title = 'Count of Approval Rating Data Points by President')

# Modify start_date to show month + year, to get a distribution of data points for sparse presidents
df_approve$start_year <- year(df_approve$start_date)

monthly_approval <- df_approve %>%
  group_by(President,
           start_year,
           month = floor_date(start_date, "month")) %>%
  summarize(avg_approval = mean(approval_rate))

monthly_approval %>%
  ggplot(aes(x = month, y = avg_approval, color = President)) +
  geom_line() +
  facet_wrap(~ President, scales = "free") +
  theme(legend.position="none") +
  labs(x = 'Date', y = 'Average Approval')
  
# -----------------------------------------------------------------
#        Analyze approval ratings by term checkpoints
# -----------------------------------------------------------------

#  Confirm president names for join
name_check <- df_approve %>%
  select(President) %>%
  full_join(presidents, by = c('President' = 'president')) %>%
  select(President, start_date) %>%
  distinct()

# Fix names
df_approve$President[df_approve$President == 'Barak Obama'] <- 'Barack Obama'
df_approve$President[df_approve$President == 'George Bush'] <- 'George H. W. Bush'
df_approve$President[df_approve$President == 'Gerald R. Ford'] <- 'Gerald Ford'

# Join with start date and mutate to add term checkpoints
presidents$start_date <- mdy(presidents$start_date)

term_checkpoints <- presidents %>%
  select(president, start_date) %>%
  full_join(df_approve, by = c('president' = 'President')) %>%
  filter(!is.na(start_date.y)) %>%
  rename(term_start = start_date.x,
         rating_date = start_date.y,
         rating_year = start_year) %>%
  select(president, term_start, rating_year, rating_date, approval_rate) %>%
  mutate(term_rating_date_delta = as.integer(rating_date - term_start))

# Visualize First 100 Days approval vs. sentiment
first_100 <- term_checkpoints %>%
  mutate(checkpoint = if_else(term_rating_date_delta <= 100, 'First 100 Days', 'After First 100 Days')) %>%
  filter(checkpoint == 'First 100 Days') %>%
  group_by(president, checkpoint) %>%
  mutate(first_100_approval = mean(approval_rate)) %>%
  select(president, checkpoint, first_100_approval) %>%
  distinct()

# Visualize First 100 Rating difference by president
first_100 %>%
  ggplot(aes(x = reorder(president, -first_100_approval), y = first_100_approval, fill = president)) +
  geom_bar(stat = 'identity') + 
  geom_text(aes(label = round(first_100_approval,2)),
            position = position_dodge(width = 1),
            hjust = -0.05, size = 5) +
  coord_flip() +
  theme(legend.position="none") +
  labs(y = 'President', 
       x = 'First 100 Days Approval Rating', 
       title = 'First 100 Days Approval Rating by President')

# -----------------------------------------------------------------------
#        Analyze sentiment vs. Approval Rating Checkpoints
# -----------------------------------------------------------------------

speech_sentiments$president_name <- tolower(speech_sentiments$president_name)
first_100$president <- tolower(first_100$president)

# Recode names
speech_sentiments$president_name[speech_sentiments$president_name == 'donald j. trump'] <- 'donald trump'
speech_sentiments$president_name[speech_sentiments$president_name == 'george bush'] <- 'george h. w. bush'
speech_sentiments$president_name[speech_sentiments$president_name == 'william j. clinton'] <- 'bill clinton'

# Confirm president names for join
name_check <- speech_sentiments %>%
  select(president_name) %>%
  full_join(first_100, by = c('president_name' = 'president'))

# Plot sentiment vs. first 100 approval
first_100_sentiment_approval <- speech_sentiments %>%
  full_join(first_100, by = c('president_name' = 'president')) %>%
  select(president_name, n, negative, positive, sentiment, negative_ratio, first_100_approval) %>%
  filter(!is.na(first_100_approval)) %>%
  filter(!is.na(sentiment))

first_100_sentiment_approval %>%
  ggplot(aes(x = first_100_approval, y = negative_ratio)) +
  geom_point(size = 2) +
  geom_smooth(method=lm) +
  geom_text(aes(label = president_name)) +
  labs(x = 'First 100 Days Average Approval', 
       y = 'Inaugural Speech Sentiment', 
       title = 'Inaugural Speech Sentiment vs. First 100 Days Approval Rating')

first_100_lm <- lm(first_100_approval ~ negative_ratio, data = first_100_sentiment_approval)
summary(first_100_lm)
