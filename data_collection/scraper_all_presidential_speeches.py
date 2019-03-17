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
innagural_address_link = 'https://www.presidency.ucsb.edu/documents/app-categories/presidential?items_per_page=60'
total_pages = round(73847/60)
page_total = 61
page_num = 0

# point to driver
driver = webdriver.Chrome('chromedriver.exe')

# open main page
driver.get(innagural_address_link)
time.sleep(5)

# initialize dictionary to store data
speech_dict = {'president_name': [], 'speech_date': [], 'speech_type': [], 'speech_text': []}

# loop through all pages and all links to grab speeches
for j in range(1, total_pages+1):
    if j == total_pages+1:
        page_total = (73847-((total_pages-1)*60))+1
    for i in range(1, page_total):
        try:
            driver.find_element_by_xpath('/html/body/div[2]/div[4]/div/section/div/section/div/div[4]/div[' + str(i) + ']/div/div/div[1]/div/p/a').click()
            test = 'pass'
        except:
            test = 'fail'
        if test == 'pass':
            # wait for page to load
            time.sleep(2)
            # test if page doesn't fully load
            try:
                # get presidents name
                president_name = driver.find_element_by_class_name('diet-title').text
                test2 = 'pass'
            except:
                # if page not loaded set test2 to fail and retry link
                test2 = 'fail'
            # if test2 failed, page has not loaded so reload the page
            if test2 == 'pass':
                # get date of speech
                speech_date = driver.find_element_by_class_name('date-display-single').text
                # get speech type
                speech_type = driver.find_element_by_class_name('field-ds-doc-title').text
                # get speech text
                speech_text = driver.find_element_by_class_name('field-docs-content').text
            else:
                # reload page
                driver.close()
                driver = webdriver.Chrome('chromedriver.exe')
                time.sleep(5)
                driver.get(innagural_address_link)
                driver.find_element_by_xpath('/html/body/div[2]/div[4]/div/section/div/section/div/div[4]/div[' + str(i) + ']/div/div/div[1]/div/p/a').click()
                # get presidents name
                president_name = driver.find_element_by_class_name('diet-title').text
                # get date of speech
                speech_date = driver.find_element_by_class_name('date-display-single').text
                # get speech type
                speech_type = driver.find_element_by_class_name('field-ds-doc-title').text
                # get speech text
                speech_text = driver.find_element_by_class_name('field-docs-content').text
            # append data to dictionary
            speech_dict['president_name'].append(president_name)
            speech_dict['speech_date'].append(speech_date)
            speech_dict['speech_type'].append(speech_type)
            speech_dict['speech_text'].append(speech_text)
            # print line for debugging
            print(president_name + ' ' + speech_date + ' ' + speech_type)
            # go back to main page
            driver.get(innagural_address_link)
        time.sleep(2)
    # set main link to next page
    page_num += 1
    innagural_address_link = 'https://www.presidency.ucsb.edu/documents/app-categories/presidential?items_per_page=60&page=' + str(page_num)
    # go to next page
    driver.get(innagural_address_link)
    time.sleep(1) 

# convert dictionary to dataframe
speech_df = pd.DataFrame.from_dict(speech_dict)

# write csv
speech_df.to_csv('all_presidential_speeches.csv', index=False)

# close driver
driver.close()
