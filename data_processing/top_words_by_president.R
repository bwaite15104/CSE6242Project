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


# Unnest the text strings into a data frame of words and get top 20 for each president
speech_words <- all_speeches %>%
select(president_name, speech_text) %>%
unnest_tokens(word, speech_text) %>% # split into individual words
anti_join(get_stopwords()) %>% # remove stop words like the, to, etc.
count(president_name, word) %>%
rename(word_count = n) %>%
arrange(president_name, desc(word_count)) %>%
group_by(president_name) %>%
filter(row_number() <= 15)

# write csv
write.csv(speech_words, 'data/top_20_words_by_president.csv')