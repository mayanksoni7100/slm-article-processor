select * from public.getArticles_for_queue(${articleIds}, ${customerId}, ${storeId}, ${storeCode}) as articles(id character varying(255), storeId integer, storecode character varying(64), nfc_url character varying(255), name character varying(512), data json, last_updated timestamp without time zone);