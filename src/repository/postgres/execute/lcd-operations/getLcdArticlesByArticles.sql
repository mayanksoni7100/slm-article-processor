select * from public.get_articles_linked_to_lcd(${articleIds}, ${customerId}, ${storeId}) as
articles(articleIds character varying(255));