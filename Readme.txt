--------------------------------URL of database:--------------------------------------------------------------------------------------------------------------------------------------

postgres://jqmvlwpfwtbtpi:2a81d49b4f5fc4bc6ef6cc48c1d5d9d3c73ba8cf76d3e1ae8f90aec12f379c24@ec2-174-129-255-91.compute-1.amazonaws.com:5432/d3u657k2vujf6i

-------------------------------Further logIn_Details to database according to heroku--------------------------------------------------------------------------------------------

Host:		ec2-174-129-255-91.compute-1.amazonaws.com
Database:	d3u657k2vujf6i
Password:	2a81d49b4f5fc4bc6ef6cc48c1d5d9d3c73ba8cf76d3e1ae8f90aec12f379c24

----------------------------------Test-User------------------------------------------------------------------------------------------------------------------------------------------

Username: test
Password: test

email: test@test.de

-----------------------For Search: Example of author who had written manay books---------------------------------------------------------------------------------------------------------

author: isaac asimov

---------------------For Search: Example of only one book------------------------------------------------------------------------------------------------------------------------------------

isbn: 0446569895

-----------------------SQL Code in regard to the tables in the database--------------------------------------------------------------------------------------------------------------

CREATE TABLE books_list (
	isbn VARCHAR NOT NULL,
	title VARCHAR NOT NULL,
	author VARCHAR NOT NULL,
	year VARCHAR NOT NULL,
	id SERIAL PRIMARY KEY
);

Create TABLE users (
	id SERIAL PRIMARY KEY,
	username VARCHAR NOT NULL,
	email VARCHAR NOT NULL,
	password VARCHAR NOT NULL
);

Create TABLE reviews (
	review_id SERIAL PRIMARY KEY,
	book_review VARCHAR NOT NULL,L,
	user_id INTEGER, 
	FOREIGN KEY(user_id) REFERENCES users(id),
        book_id INTEGER,
        FOREIGN KEY(book_id) REFERENCES books_list(id)
);