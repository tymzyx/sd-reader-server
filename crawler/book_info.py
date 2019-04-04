# -*- coding:utf-8
import requests
from bs4 import BeautifulSoup
import threading
import time
from pymongo import MongoClient
import uuid
from pypinyin import lazy_pinyin
import base64

tag_url = 'https://book.douban.com/tag/'

headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'Host': 'www.douban.com',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
    'Content-Type': 'text/html; charset=utf-8'
}

book_type_mapper = {
    '小说': 'novel',
    '文学': 'literature',
    '成功': 'success',
    '营销管理': 'marketing',
    '经济': 'economy',
    '计算机': 'computer',
    '科普': 'science',
    '社科': 'social'
}


class MyThread(threading.Thread):  # 继承父类threading.Thread
    def __init__(self, thread_id, thread_name, thread_func, collection, base_info, count=0, start_index=0):
        threading.Thread.__init__(self)
        self.thread_id = thread_id
        self.thread_name = thread_name
        self.thread_func = thread_func
        self.collection = collection
        self.base_info = base_info
        self.count = count
        self.start_index = start_index

    def run(self):
        print 'Starting ' + self.thread_name
        self.thread_func(self.base_info, self.count, self.start_index, self.collection, self.thread_name)
        print 'Exiting ' + self.thread_name


def connect_db(db_name):
    client = MongoClient('localhost', 27017)
    db = client[db_name]
    return db


def get_tag_info():
    html = requests.get(tag_url, headers).text
    soup = BeautifulSoup(html, 'lxml')
    title_nodes = soup.find_all('a', class_='tag-title-wrapper')
    content_table_nodes = soup.find_all('table', class_='tagCol')
    tag_info = {}
    for i in range(len(title_nodes)):
        title_node = title_nodes[i]
        content_row_nodes = content_table_nodes[i].find_all('tr')
        temp_tag_content = []
        for j in range(len(content_row_nodes)):
            content_nodes = content_row_nodes[j].find_all('td')
            for content_node in content_nodes:
                tag_name = content_node.find('a').get_text()
                tag_num = content_node.find('b').get_text()
                temp_tag_content.append({
                    'tag_name': tag_name,
                    'tag_num': tag_num[1:len(tag_num)-1]
                })
        tag_info[title_node['name']] = temp_tag_content


def get_book_detail(tag_type, collection):
    page_nums = 1
    for page in range(page_nums):
        insert_data = []
        start_num = page * 20
        url = tag_url + tag_type + '?start=' + str(start_num) + '&type=T'  # type S -> 按评价; R -> 按出版日期; T -> 综合
        html = requests.get(url, headers).text
        soup = BeautifulSoup(html, 'lxml')
        book_item_nodes = soup.find_all('li', class_='subject-item')
        for book_item_node in book_item_nodes:
            book_other_detail = book_item_node.find('div', class_='pub').get_text().strip().split('/')
            author = book_other_detail[0].strip()  # 作者
            author_pinyin = ' '.join(lazy_pinyin(author))
            detail_url = book_item_node.find('div', class_='info').find('a')['href']
            detail_html = requests.get(detail_url, headers).text
            detail_soup = BeautifulSoup(detail_html, 'lxml')
            book_title = detail_soup.find('h1').find('span').get_text()  # 书名
            if validate_document(collection,
                                 {'title': book_title, 'type': book_type_mapper[tag_type], 'author': author}):
                continue
            title_pinyin = ' '.join(lazy_pinyin(book_title))
            print '正在爬取 ' + tag_type + ' ' + book_title.encode('utf-8')
            book_id = str(uuid.uuid1())  # 图书id
            indent_nodes = detail_soup.find_all('div', class_='indent')
            indent_content_intros = indent_nodes[1].find_all('div', class_='intro')
            if len(indent_content_intros) > 1:
                indent_content_intro = '-'.join(map(lambda x: x.get_text(),
                                                    indent_content_intros[1].find_all('p')))  # 内容简介
            elif len(indent_content_intros) == 1:
                indent_content_intro = '-'.join(map(lambda x: x.get_text(),
                                                    indent_content_intros[0].find_all('p')))  # 内容简介
            else:
                indent_content_intro = ''
            indent_catalog_node = detail_soup.find('div', id='dir_' + book_id + '_full')
            if indent_catalog_node:
                indent_catalog_intro = indent_catalog_node.get_text('-', strip=True).split('-')
                indent_catalog_intro = indent_catalog_intro[:-3]  # 目录
            else:
                indent_catalog_intro = []
            img_url = book_item_node.find('div', class_='pic').find('img')['src']
            book_img = base64.b64encode(get_book_img(img_url))  # 图书封面
            insert_data.append({
                'id': book_id,
                'title': book_title,
                'pinyin': title_pinyin,
                'author': author,
                'author_pinyin': author_pinyin,
                'image': 'data:image/jpeg;base64,' + book_img,
                'brief': indent_content_intro,
                'catalog': indent_catalog_intro,
                'type': book_type_mapper[tag_type],
                'share': 'admin'
            })
            time.sleep(1)
        time.sleep(1)
        # 插入数据库
        print 'insert to mongodb'
        collection.insert_many(insert_data)


def get_book_img(img_url):
    return requests.get(img_url).content


def validate_document(collection, params):
    result = collection.find_one({
        'title': params['title'],
        'type': params['type']
    })
    return bool(result)


def main_crawler():
    mongo = connect_db('reader')
    collection = mongo.book
    get_book_detail('社科', collection)
    return


if __name__ == '__main__':
    main_crawler()
