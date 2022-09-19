

#Python program to scrape website 
from selenium import webdriver


driver = webdriver.Chrome("/Users/OMI/Desktop/auctree_stats/chromedriver")#, chrome_options=options)

import time

driver.get("https://www.similarweb.com/website/auctree.com/")
page_source = driver.page_source
#print(page_source)


import requests 
from bs4 import BeautifulSoup
from IPython.core.display import HTML

styles = requests.get("https://raw.githubusercontent.com/Harvard-IACS/2018-CS109A/master/content/styles/cs109.css").text
HTML(styles)

soup = BeautifulSoup(page_source, 'html5lib') #'soupify' for traversal using bs4


body = soup.find('div', attrs = {'class': 'wa-overview__row'}) 

ranks = body.findAll('p', attrs = {'class': 'wa-rank-list__value'}) 
g_rank = ranks[0].text#global rank
c_rank = ranks[1].text#country rank
print(g_rank, c_rank)
rank_incrs = body.findAll('span', attrs = {'class': 'data-parameter-change data-parameter-change--md data-parameter-change--up'}) 
g_rank_incr = rank_incrs[0].text#global rank increase
c_rank_incr = rank_incrs[1].text#country rank increase
print(g_rank_incr, c_rank_incr)
engagement = body.findAll('p', attrs = {'class': 'engagement-list__item-value'})
total_visits = engagement[0].text
bounce_rate = engagement[1].text
pages_per_visit = engagement[2].text
avg_duration = engagement[3].text 


print('total no. of visits: ', total_visits)
print('bounce rate: ', bounce_rate)
print('pages per visit: ',pages_per_visit)
print('average duration: ',avg_duration)
print('global rank: ', g_rank)
print('global rank increment: ', g_rank_incr)
print('country rank: ', c_rank)
print('country rank incr:', c_rank_incr)



import smtplib, ssl

port = 587  # For starttls
smtp_server = "smtp.gmail.com"
sender_email = "info@shopmob.ng"
receiver_email = "oyejr@hotmail.com"
password = input("Type your password and press enter:")
message = " "
message += 'total no. of visits: '+ total_visits
message += 'bounce rate: '+ bounce_rate
message += 'pages per visit: '+ pages_per_visit
message += 'average duration: '+ avg_duration
message += 'global rank: ', g_rank
message += 'global rank increment: '+ g_rank_incr
message += 'country rank: '+ c_rank
message += 'country rank incr:'+ c_rank_incr

context = ssl.create_default_context()
with smtplib.SMTP(smtp_server, port) as server:
    server.starttls(context=context)
    server.login(sender_email, password)
    server.sendmail(sender_email, receiver_email, message)
