
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
#speech_sentiments <- tbl_df(read.csv('speech_polarity_and_diversity.csv', stringsAsFactors = FALSE))
presidents <- tbl_df(read.csv('president_terms.csv', stringsAsFactors = FALSE))
speech_sentiments <- tbl_df(read.csv('speech_polarity_for_model.csv', stringsAsFactors = FALSE))

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
  summarize(avg_approval = mean(approval_rate)) %>%
  rename(president = President)

monthly_approval %>%
  ggplot(aes(x = month, y = avg_approval, color = president)) +
  geom_line() +
  facet_wrap(~ president, scales = "free") +
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
#        Analyze monthly sentiment by president
# -----------------------------------------------------------------------

# check president names
speech_sentiments$president_name <- tolower(speech_sentiments$president_name)
levels(as.factor(speech_sentiments$president_name))

# Recode names
speech_sentiments$president_name[speech_sentiments$president_name == 'george bush'] <- 'george h. w. bush'

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

# Add predictors columns
speech_sentiments$negative_ratio <- speech_sentiments$negative / speech_sentiments$speech_diversity
speech_sentiments$positive_ratio <- speech_sentiments$positive / speech_sentiments$speech_diversity

# Create monthly sentiment dataframe
monthly_sentiment <- speech_sentiments %>%
  rename(president = president_name) %>%
  select(president, speech_date, speech_year, negative, positive, sentiment, speech_diversity, negative_ratio, positive_ratio) %>%
  group_by(president,
           speech_year,
           month = floor_date(speech_date, "month")) %>%
  summarize(avg_negative = mean(negative),
            avg_positive = mean(positive),
            avg_sentiment = mean(sentiment),
            avg_diversity = mean(speech_diversity),
            avg_negative_ratio = mean(negative_ratio),
            avg_positive_ratio = mean(positive_ratio))

# ------ 
# Filtering within presidential term limits
# -----
# Add president terms to filter data within those terms
presidents$end_date <- mdy(presidents$end_date)
# Modify dataframe to handle presidents with non-consecutive terms
presidents <- presidents %>%
  select(president, start_date, end_date) %>%
  group_by(president) %>%
  summarise(start_date = min(start_date),
            end_date = max(end_date))

presidents$president <- tolower(presidents$president)
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


# --------------------------------------------------------------------------------------------------
# Sentiment vs. Approval modeling
# --------------------------------------------------------------------------------------------------

sentiment_vs_approval <- monthly_sentiment %>%
  full_join(monthly_approval, by = c('president' = 'president', 'speech_year' = 'start_year', 'month' = 'month')) %>%
  filter(!is.na(avg_approval)) %>%
  filter(!is.na(avg_sentiment))

# Find outliers in approval & sentiment
boxplot(sentiment_vs_approval$avg_approval) # Looks fine except for 1 value, probably not an outlier
boxplot(sentiment_vs_approval$avg_sentiment) # Looks like there a few outliers, but only going to filter the extreme outliers over 80
sentiment_vs_approval <- sentiment_vs_approval %>% filter(avg_sentiment < 80)

# Plot approval vs. sentiment
sentiment_vs_approval %>%
  ggplot(aes(x = avg_approval, y = avg_sentiment)) +
  geom_point(size = 2) +
  geom_smooth(method="auto") +
  labs(x = 'Monthly Average Approval Rating', 
       y = 'Monthly Average Speech Sentiment', 
       title = 'Monthly Speech Sentiment vs. Approval Rating')

# Taking a look at a linear regressio model output fit to all of the data
all_speeches_approval_lm <- lm(avg_approval ~ avg_negative_ratio  + avg_diversity + avg_sentiment, data = sentiment_vs_approval)
summary(all_speeches_approval_lm) # very weak rSquared at about 3%

# Based on the output from the plot above, there is a different relationship between sentiment and approval rating in different parts of the data
# Below I am going to loop through approval rating to find the strongest rSquared, which I will then compare to the rsquared for all of the data

rSquared <- 0.0
for (i in seq(0.3, 1, by = 0.01)) {
  
  # filter dataframe by approval rate
  filtered_lm_df <- sentiment_vs_approval %>%
    filter(avg_approval <= i)
  
  # Fit model
  all_speeches_approval_lm <- lm(avg_approval ~ avg_negative_ratio  + avg_diversity + avg_sentiment, data = filtered_lm_df)
  
  # Extract rSquared if higher than previous value
  if (!is.na(summary(all_speeches_approval_lm)$r.squared) & summary(all_speeches_approval_lm)$r.squared > rSquared) {
    rSquared <- summary(all_speeches_approval_lm)$r.squared
    approval_threshold <- i
  }
}
print(rSquared)
print(approval_threshold)

# Linear regression to explain avg approval based on avg sentiment
filtered_lm_df <- sentiment_vs_approval %>%
  filter(avg_approval < approval_threshold)

# Linear regression modeling approval by sentiment scores
all_speeches_approval_lm1 <- lm(avg_approval ~ avg_negative_ratio  + avg_diversity + avg_sentiment, data = filtered_lm_df)
summary(all_speeches_approval_lm1)
all_speeches_approval_lm2 <- lm(avg_approval ~ avg_diversity , data = filtered_lm_df)
summary(all_speeches_approval_lm2)
all_speeches_approval_lm3 <- lm(avg_approval ~ avg_negative_ratio, data = filtered_lm_df)
summary(all_speeches_approval_lm3)
all_speeches_approval_lm4 <- lm(avg_approval ~ avg_sentiment, data = filtered_lm_df)
summary(all_speeches_approval_lm4)


# -----------------------------------------------------------------------------
#  Decision Tree and Random Forest Regression Modeling
# -----------------------------------------------------------------------------

# Because we found that there is a different relationship between approval ratings and sentiment in different ranges of the data,
# the next step is to fit a decision tree to see where there may be different relationship strengths

# Classification Tree with rpart
library(rpart)
library(rpart.plot)

# grow tree 
tree1 <- rpart(avg_approval ~ avg_negative_ratio  + avg_diversity + avg_sentiment, method="anova", data=sentiment_vs_approval)
#tree1 <- rpart(avg_sentiment ~ avg_approval, method="anova", data=sentiment_vs_approval)

printcp(tree1) # display the results 
plotcp(tree1) # visualize cross-validation results 
summary(tree1) # detailed summary of splits

# create additional plots 
par(mfrow=c(1,2)) # two plots on one page 
rsq.rpart(tree1) # visualize cross-validation results   

# plot tree 
par(mfrow=c(1,1))
plot(tree1, uniform=TRUE, 
     main="Regression Tree for Sentiment vs. Approval")
text(tree1, use.n=TRUE, all=TRUE, cex=.8)

par(mfrow=c(1,1))
rpart.plot(tree1)

# Random Forest prediction of Kyphosis data
library(randomForest)
set.seed(17)
fit <- randomForest(avg_approval ~ avg_negative_ratio  + avg_diversity + avg_sentiment, data=sentiment_vs_approval)
print(fit) # view results 
importance(fit) # importance of each predictor



