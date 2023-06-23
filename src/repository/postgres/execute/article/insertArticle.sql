
	insert into e_article(id, customer_id, store_id, created, name, nfc_url, input_data_id, seq, data, input_batch_id, md5_hash, eans, last_modified, register_date)
	values(${id}, ${customerId}, ${storeId}, now(), ${name}, ${nfc_url}, ${inputDataId}, nextval('seq_article_seq'), ${data}, ${inputBatchId}, ${md5Hash}, ${eans}, now(), now())
	ON CONFLICT (id, store_id)
	DO
	UPDATE SET name = ${name}, nfc_url = ${nfc_url}, created = now(), last_modified = now(), seq = nextval('seq_article_seq'), data = ${data}, input_data_id = ${inputDataId}, input_batch_id = ${inputBatchId}, md5_hash = ${md5Hash}, eans=COALESCE(${eans},e_article.eans);


