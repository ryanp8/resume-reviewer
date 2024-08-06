from bs4 import BeautifulSoup
from bs4.element import Comment
import requests
import sys
import asyncio
import aiohttp
from configparser import ConfigParser
import boto3
import os

GITHUB_URL = 'https://github.com/SimplifyJobs/Summer2025-Internships?tab=readme-ov-file'
KEYWORDS = set([ "manage", "develop", "python", "project", "analysis", "java", "c++", "javascript", "react",
            "html", "css", "sql", "nosql", "aws", "azure", "google cloud", "docker", "kubernetes",
            "rest", "soap", "machine learning", "ai", "data analysis", "big data", "devops", "agile",
            "scrum", "leadership", "communication", "collaboration", "problem-solving", "critical thinking",
            "time management", "adaptability", "creativity", "teamwork", "negotiation", "mentoring",
            "pmp", "budgeting", "scheduling", "risk management", "stakeholder management", "resource allocation",
            "planning", "execution", "monitoring", "closure", "data mining", "data visualization", "etl",
            "hadoop", "spark", "tableau", "power bi", "statistics", "test-driven development", "behavior-driven development",
            "continuous integration", "continuous deployment", "version control", "git", "svn", "jira",
            "confluence", "healthcare", "finance", "education", "manufacturing", "retail", "e-commerce",
            "cybersecurity", "market analysis", "business strategy", "financial analysis", "sales", "marketing",
            "customer service", "business", "management", "ux", "ui", "design", "graphic design",
            "technical", "product", "crm", "erp systems", "C#", "quick", "bachelors", "masters", "degree",
            "2026", "innovate","technology", "performance", "team", "impact", "improve", "leverage", "latency"])

def tag_visible(element):
    if element.parent.name in ['style', 'script', 'head', 'title', 'meta', '[document]']:
        return False
    if isinstance(element, Comment):
        return False
    return True


def text_from_html(body):
    soup = BeautifulSoup(body, 'html.parser')
    texts = soup.findAll(text=True)
    visible_texts = filter(tag_visible, texts)
    return u" ".join(t.strip() for t in visible_texts)


async def fetch(session, url):
    try:
        async with session.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=2) as response:
            body = await response.text()
            text = text_from_html(body)
            text = text.replace('.', '') \
                        .replace(',', '') \
                        .replace('-','') \
                        .replace('?','') \
                        .replace('[', '') \
                        .replace(']','') \
                        .replace('/', ' ') \
                        .replace('(','') \
                        .replace(')', '') \
                        .replace('\t',' ')
            freqs = {}
            for line in text.split('\n'):
                for word in line.split(' '):
                    key = word.lower()
                    if key in KEYWORDS:
                        freqs[key] = freqs.get(key, 0) + 1
            return freqs
    except:
        return {}


async def get_listings():
    response = requests.get(GITHUB_URL, headers={'User-Agent': 'Mozilla/5.0'})
    if response.status_code != 200:
        print('Invalid response from github')
        print(response.content)
        sys.exit(1)
    soup = BeautifulSoup(response.content, 'html.parser')
    listings_table = soup.find('markdown-accessiblity-table', recursive=True)
    listing_urls = []
    for img in listings_table.find_all('img', attrs={'alt': 'Apply'}):
        listing_urls.append(img.parent['href'])

    async with aiohttp.ClientSession() as session:
        tasks = []
        for url in listing_urls:
            tasks.append(fetch(session, url))
        freqs = await asyncio.gather(*tasks)
        result = {}
        for freq_map in freqs:
            for word, freq in freq_map.items():
                result[word] = result.get(word, 0) + 1
        return result

async def main():
    config_file = 'config.ini'
    os.environ['AWS_SHARED_CREDENTIALS_FILE'] = config_file

    configur = ConfigParser()
    configur.read(config_file)
    # configure for S3 access:
    s3_profile = 'cs310-final-s3-admin'
    boto3.setup_default_session(profile_name=s3_profile)

    bucketname = configur.get('s3', 'bucket_name')

    s3 = boto3.resource('s3')
    bucket = s3.Bucket(bucketname)

    freqs = await get_listings()
    keys = sorted(freqs.keys(), key=lambda k: freqs[k], reverse=True)
    with open('results.txt', 'w+') as f:
        for key in keys:
            f.write(f'{key} {freqs[key]}\n')

    bucket.upload_file('results.txt', 'keywords.txt')

if __name__ == '__main__':
    asyncio.run(main())