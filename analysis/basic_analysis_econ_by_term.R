
# -----------------------------------------------------------------
#                               Analysis set up
# -----------------------------------------------------------------

#setwd("/Users/wwaite/Dev/gtech/CSE 6242/bwaite15104.github.io/analysis/")
#setwd("/Users/wwaite/Dev/gtech/CSE 6242/bwaite15104.github.io/data/")
setwd("~/OneDrive/GT/6242 Project/bwaite15104.github.io/bwaite15104.github.io.ela/data")

# Load libraries
library(ggplot2)
library(dplyr)
library(tidyr)
library(lubridate)

# Load datasets
monthly_sentiment <- tbl_df(read.csv('monthly_time_series_viz_data_approvals.csv', stringsAsFactors = FALSE))
president_econ <- tribble(
  ~no, ~bd, ~ed, ~nm, ~pa,
  34,"January 1, 1953","December 1, 1960","Dwight D. Eisenhower","Republican",
  35,"January 1, 1961","November 1, 1963","John F. Kennedy","Democratic",
  36,"December 1, 1963","December 1, 1968","Lyndon B. Johnson","Democratic",
  37,"January 1, 1969","July 1, 1974","Richard Nixon","Republican",
  38,"August 1, 1974","December 1, 1976","Gerald Ford","Republican",
  39,"January 1, 1977","December 1, 1980","Jimmy Carter","Democratic",
  40,"January 1, 1981","December 1, 1988","Ronald Reagan","Republican",
  41,"January 1, 1989","December 1, 1992","George H. W. Bush","Republican",
  42,"January 1, 1993","December 1, 2000","Bill Clinton","Democratic",
  43,"January 1, 2001","December 1, 2008","George W. Bush","Republican",
  44,"January 1, 2009","December 1, 2016","Barack Obama","Democratic",
  45,"January 1, 2017","December 1, 2019","Donald Trump","Republican"
)
#president_econ$bd <- mdy(president_econ$bd)
#president_econ$ed <- mdy(president_econ$ed)

# -----------------------------------------------------------------
#                               Analysis set up
# -----------------------------------------------------------------

#setwd("~/OneDrive/GT/6242 Project/bwaite15104.github.io/data")

monthly_sentiment$month <- ymd(monthly_sentiment$month)

# --------------------------------------------------------------------------------------------------
# Sentiment vs. Economics modeling
# --------------------------------------------------------------------------------------------------
economic0 <- tbl_df(read.csv('economic_data.csv', stringsAsFactors = FALSE))
economic1 <- tbl_df(read.csv('economic_data.csv', stringsAsFactors = FALSE))

economic0$date <- mdy(economic0$date)
economic1$date <- mdy(economic1$date) %m+% months(1)

economics <- economic0 %>%
  full_join(economic1, by = c('date' = 'date'))

economics$unemploychg <- -100 * (economics$unemploy.x - economics$unemploy.y) / economics$unemploy.y
economics$sp500chg <- 100 * (economics$sp500.x - economics$sp500.y) / economics$sp500.y
economics$cons_sentchg <- 100 * (economics$cons_sent.x - economics$cons_sent.y) / economics$cons_sent.y
economics$real_gdpchg <- (economics$real_gdp.x)# - economics$real_gdp.y)
economics$cpichg <- -100 * (economics$cpi.x - economics$cpi.y) / economics$cpi.y
economics$pcechg <- 100 * (economics$pce.x - economics$pce.y) / economics$pce.y
economics$gdpc1chg <- 100 * (economics$gdpc1.x - economics$gdpc1.y) / economics$gdpc1.y
economics$ind_prochg <- 100 * (economics$ind_pro.x - economics$ind_pro.y) / economics$ind_pro.y
economics$savingschg <- (economics$savings.x - economics$savings.y)


economics$unemploychg[which(!is.finite(economics$unemploychg))] = NA
economics$sp500chg[which(!is.finite(economics$sp500chg))] = NA
economics$cons_sentchg[which(!is.finite(economics$cons_sentchg))] = NA
economics$real_gdpchg[which(!is.finite(economics$real_gdpchg))] = NA
economics$cpichg[which(!is.finite(economics$cpichg))] = NA
economics$pcechg[which(!is.finite(economics$pcechg))] = NA
economics$gdpc1chg[which(!is.finite(economics$gdpc1chg))] = NA
economics$ind_prochg[which(!is.finite(economics$ind_prochg))] = NA
economics$savingschg[which(!is.finite(economics$savingschg))] = NA

economics <- subset(economics, select = c("date","unemploychg","sp500chg","cons_sentchg","real_gdpchg","cpichg","pcechg","gdpc1chg","ind_prochg","savingschg"))

sentiment_vs_economics <- monthly_sentiment %>%
  full_join(economics, by = c('month' = 'date'))

sentiment_vs_economics <- sentiment_vs_economics[(sentiment_vs_economics$month>="1959-01-01"),]
sentiment_vs_economics <- sentiment_vs_economics[(sentiment_vs_economics$month<="2018-07-01"),]

# apply it
sentiment_vs_economics$avg_sentiment_ctr <- scale(sentiment_vs_economics$avg_sentiment, scale=FALSE)

# Taking a look at a linear regression model output fit to all of the data
all_speeches_econ_lm <- lm(avg_sentiment ~ unemploychg  + sp500chg + cons_sentchg + real_gdpchg + cpichg + pcechg + gdpc1chg + ind_prochg + savingschg, data = sentiment_vs_economics)
summary(all_speeches_econ_lm)

#note: strong correlation with CPI, weaker correlation with unemployment and PCE
#note: used a one-month lag to observe effects of speech sentiment
#note: used pct chg for economic values

#write.csv(sentiment_vs_economics, file = "sentiment_vs_economics.csv")

library(devtools)
library(broom)
tidy_asel = t(tidy(all_speeches_econ_lm))
tidy_lm = c()

for (row in 1:nrow(president_econ)) {
  n <- president_econ[row, "nm"]
  b <- mdy((president_econ[row, "bd"]))
  e <- mdy((president_econ[row, "ed"]))
  print(paste(n,b,e, sep=","))
  
  mysentiment_vs_economics <- sentiment_vs_economics
  
  mysentiment_vs_economics <- mysentiment_vs_economics[(mysentiment_vs_economics$month>=b),]
  mysentiment_vs_economics <- mysentiment_vs_economics[(mysentiment_vs_economics$month<=e),]
  mysentiment_vs_economics$avg_sentiment_ctr <- scale(mysentiment_vs_economics$avg_sentiment, scale=FALSE)
  my_speeches_econ_lm <- lm(avg_sentiment ~ unemploychg  + sp500chg + cons_sentchg + real_gdpchg + cpichg + pcechg + gdpc1chg + ind_prochg + savingschg, data = mysentiment_vs_economics)
  summary(my_speeches_econ_lm)
  tidy_asel = as.data.frame(t(tidy(my_speeches_econ_lm)[,5]))
  tidy_lm = bind_rows(tidy_lm,tidy_asel)
}

econ_lm = bind_cols(president_econ,tidy_lm)

cols = c("intercept","unemploychg","sp500chg","cons_sentchg","real_gdpchg","cpichg","pcechg","gdpc1chg","ind_prochg","savingschg")
