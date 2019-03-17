###################################################
#
# Web Scraper for Presidential Inaugural Address
#
###################################################

import pandas as pd
import os
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time

# variable setup
innagural_address_link = 'https://www.presidency.ucsb.edu/documents/presidential-documents-archive-guidebook/inaugural-addresses'

# point to driver
driver = webdriver.Chrome('chromedriver.exe')

# open main page
driver.get(innagural_address_link)
time.sleep(5)

# initialize dictionary to store data
speech_dict = {'president_name': [], 'speech_date': [], 'speech_text': []}

# loop through all links
for i in range(1, 108):
    try:
        driver.find_element_by_xpath('/html/body/div[2]/div[4]/div/section/div/section/div/div/div/div[2]/table/tbody/tr[' + str(i) + ']/td[2]/a').click()
        test = 'pass'
    except:
        test = 'fail'
    # if first link structure doesn't exist, test second structure
    if test == 'fail':
        try:
            driver.find_element_by_xpath('/html/body/div[2]/div[4]/div/section/div/section/div/div/div/div[2]/table/tbody/tr[' + str(i) + ']/td[2]/p/a').click()
            test = 'pass'
        except:
            print("no link")
    if test == 'pass':
        # wait for page to load
        time.sleep(5)
        # get presidents name
        president_name = driver.find_element_by_class_name('diet-title').text
        # get date of speech
        speech_date = driver.find_element_by_class_name('date-display-single').text
        # get speech text
        speech_text = driver.find_element_by_class_name('field-docs-content').text
        # append data to dictionary
        speech_dict['president_name'].append(president_name)
        speech_dict['speech_date'].append(speech_date)
        speech_dict['speech_text'].append(speech_text)
        # go back to main page
        driver.get(innagural_address_link)
    time.sleep(2)

# convert dictionary to dataframe
speech_df = pd.DataFrame.from_dict(speech_dict)

# write csv
speech_df.to_csv('presidential_inaugural_speeches.csv', index=False)

# close driver
driver.close()