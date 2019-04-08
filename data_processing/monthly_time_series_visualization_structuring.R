
# -----------------------------------------------------------------
#                                     Set up
# -----------------------------------------------------------------

setwd("/Users/wwaite/Dev/gtech/CSE 6242/bwaite15104.github.io/data/")

# Load libraries
library(ggplot2)
library(dplyr)
library(tidyr)
library(lubridate)

# Load datasets
approval <- tbl_df(read.csv('Presidential Approval Ratings.csv', stringsAsFactors = FALSE))

# -----------------------------------------------------------------
#                  Approval Rating Structure
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

# Modify start_date to show month + year, to get a distribution of data points for sparse presidents
df_approve$start_year <- year(df_approve$start_date)

# Create monthly data set
monthly_approval <- df_approve %>%
  group_by(President,
           start_year,
           month = floor_date(start_date, "month")) %>%
  summarize(avg_approval = mean(approval_rate)) %>%
  rename(president = President)

# Recode names
monthly_approval$president[monthly_approval$president == 'George H.W. Bush'] <- 'george bush'
monthly_approval$president[monthly_approval$president == 'Gerald R. Ford'] <- 'gerald ford'

monthly_approval %>%
  ggplot(aes(x = month, y = avg_approval, color = president)) +
  geom_line() +
  facet_wrap(~ president, scales = "free") +
  theme(legend.position="none") +
  labs(x = 'Date', y = 'Average Approval')


# -----------------------------------------------------------------------
#                                 Sentiment Structure
# -----------------------------------------------------------------------

speech_sentiments <- tbl_df(read.csv('speech_polarity_for_model_AFINN.csv', stringsAsFactors = FALSE))

# check president names
speech_sentiments$president_name <- tolower(speech_sentiments$president_name)
levels(as.factor(speech_sentiments$president_name))

monthly_approval$president <- tolower(monthly_approval$president)
levels(as.factor(monthly_approval$president))

# Confirm president names for join
name_check <- speech_sentiments %>%
  select(president_name) %>%
  full_join(monthly_approval, by = c('president_name' = 'president')) %>%
  select(president_name) %>%
  distinct()

# Fix date & add year
speech_sentiments$speech_date <- mdy(speech_sentiments$speech_date)
speech_sentiments$speech_year <- year(speech_sentiments$speech_date)

# Create monthly sentiment dataframe
monthly_sentiment <- speech_sentiments %>%
  rename(president = president_name) %>%
  select(president, speech_date, speech_year, sentiment) %>%
  group_by(president,
           speech_year,
           month = floor_date(speech_date, "month")) %>%
  summarize(avg_sentiment = mean(sentiment))

# ------ 
# Filtering within presidential term limits
# -----

# Load presidents data set
presidents <- tbl_df(read.csv('president_terms.csv', stringsAsFactors = FALSE))
presidents$president <- tolower(presidents$president) 

# Recode names
presidents$president[presidents$president == 'george h. w. bush'] <- 'george bush'

# Add president terms to filter data within those terms
presidents$end_date <- mdy(presidents$end_date)
presidents$start_date <- mdy(presidents$start_date)

# Modify dataframe to handle presidents with non-consecutive terms
presidents <- presidents %>%
  select(president, start_date, end_date) %>%
  group_by(president) %>%
  summarise(start_date = min(start_date),
            end_date = max(end_date))

name_check <- presidents
name_check$presidents_df_name <- name_check$president 
name_check <- name_check %>%
  select(president, presidents_df_name)

name_check_sentiment_df <- monthly_sentiment %>%
  ungroup() %>%
  select(president) %>%
  distinct()
name_check_sentiment_df$sentiment_df_name <- name_check_sentiment_df$president

# All names match for join
name_check <- name_check %>%
  left_join(name_check_sentiment_df, by = c('president' = 'president'))

# Handle missing end date for trump because he's currently in office
presidents$end_date[is.na(presidents$end_date)] <- Sys.Date()

# Make sure data is within presidential terms
monthly_sentiment <- monthly_sentiment %>%
  left_join(presidents, by = c('president' = 'president')) %>%
  mutate(start_date = floor_date(start_date, "month"),
         end_date = floor_date(end_date, "month")) %>%
  filter(month >= start_date) %>%
  filter(month <= end_date)

# ------- 
# Finishing visualization of monthly sentiment
# -----
monthly_sentiment %>%
  ggplot(aes(x = month, y = avg_sentiment, color = president)) +
  geom_line() +
  facet_wrap(~ president, scales = "free") +
  theme(legend.position="none") +
  labs(x = 'Date', y = 'Average Sentiment')

# -----------------------------------------------------------------------
#                  Approval Sentiment Join and output
# -----------------------------------------------------------------------

sentiment_vs_approval <- monthly_sentiment %>%
  full_join(monthly_approval, by = c('president' = 'president', 'speech_year' = 'start_year', 'month' = 'month')) %>%
  select(president, speech_year, month, avg_sentiment, avg_approval) %>%
  ungroup()

# Check to see if approval ratings still work
sentiment_vs_approval %>%
  filter(!is.na(avg_approval)) %>%
  ggplot(aes(x = month, y = avg_approval, color = president)) +
  geom_line() +
  facet_wrap(~ president, scales = "free") +
  theme(legend.position="none") +
  labs(x = 'Date', y = 'Average Approval')

sentiment_vs_approval %>%
  filter(!is.na(avg_sentiment)) %>%
  ggplot(aes(x = month, y = avg_sentiment, color = president)) +
  geom_line() +
  facet_wrap(~ president, scales = "free") +
  theme(legend.position="none") +
  labs(x = 'Date', y = 'Average Sentiment')

# -----------------------------------------------------------------------
#                          Impute Missing Data
# ----------------------------------------------------------------------

# order by president and date
impute <- sentiment_vs_approval %>%
  arrange(president, month)

for (i in 1:nrow(impute)) {
  print(i)
  if (i == 1) {
    impute$avg_approval[i] <- NA
  } else if (i <= nrow(impute)) {
    # Store presidents for comparison
    prez <- impute$president[i]
    prev_prez <- impute$president[i-1]
    next_prez <- impute$president[i+1]
    
    # Store Approval ratings for comparison
    approval <- impute$avg_approval[i]
    prev_approval <- impute$avg_approval[i-1]
    next_approval <- impute$avg_approval[i+1]
    
    # Test for NA value
    if (is.na(approval)) {
      # Handle case where first appearance of president
      if (prev_prez != prez) {
        impute$avg_approval[i] <- next_approval
      } else if (prez == prev_prez & prez == next_prez) {
        approve_sum <- 0
        count <- 0
        approve_mean <- NA
        # Handle surrounding missing values
        if (!is.na(prev_approval)) {
          approve_sum <- approve_sum + prev_approval
          count <- count + 1
        }
        if(!is.na(next_approval)) {
          approve_sum <- approve_sum + next_approval
          count <- count + 1
        }
        if(!is.na(approve_sum)) {
          impute$avg_approval[i] <- approve_sum/count
        } else {
          impute$avg_approval[i] <- impute$avg_approval[i] 
        }
      } else if (prez != next_prez) {
        impute$avg_approval[i] <- prev_approval
      }
    }
  } else {
    impute$avg_approval[i] <- impute$avg_approval[i-1]
  }
}

# -----------------------------------------------------------------------
#                     Write Data and Test Output
# -----------------------------------------------------------------------
# Test time series dual axis

# The dualplot() function:
source("https://gist.githubusercontent.com/ellisp/4002241def4e2b360189e58c3f461b4a/raw/e959562be9e7a4d919a9c454d8b1b70cde904ab0/dualplot.R")     
  

test <- sentiment_vs_approval %>% filter(president == 'barack obama')

dualplot(x1 = test$month, y1 = test$avg_sentiment,
         x2 = test$month, y2 = test$avg_approval, 
         ylab1 = "Avg Sentiment", ylab2 = "Avg Approval", 
         legx = "topright", 
         main = "Monthly Time Series Avg Sentiment vs. Avg Approval (Barack obama)")

impute$president <- toupper(impute$president)
# Fix NA values
impute$avg_approval[is.na(impute$avg_approval)] <- NaN

  write.csv(impute, 'monthly_time_series_viz_data_approvals.csv')

