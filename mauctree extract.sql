CREATE DATABASE MauctreeLDW
ALTER DATABASE MauctreeLDW COLLATE Latin1_General_100_BIN2_UTF8;

CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'Ribbon111';

CREATE DATABASE SCOPED CREDENTIAL ShopmobStorageCredentials
WITH IDENTITY = 'SHARED ACCESS SIGNATURE',
    SECRET = '?sv=2021-06-08&ss=bfqt&srt=sco&sp=rwdlacupyx&se=2023-08-28T00:12:56Z&st=2022-08-27T16:12:56Z&spr=https&sig=XuD6eNLKqHO3t3hcmSjHBVxCRt%2F8j4GKsy8R1449KLQ%3D';

CREATE EXTERNAL DATA SOURCE SalesData WITH (
    CREDENTIAL = ShopmobStorageCredentials,
    LOCATION = 'https://shopmobetl.blob.core.windows.net/'
);

CREATE SCHEMA LDW AUTHORIZATION dbo;

drop view LDW.Properties

CREATE VIEW LDW.Properties
AS
SELECT *
from openrowset(
    bulk 'https://shopmobetl.blob.core.windows.net/mauctree/content/auctree_big.csv',
    parser_version = '2.0',
    format='csv',
    firstrow = 2
    ) with(
        ser_no varchar(100) 2,
        name_ varchar(100) 3,
        region varchar(100) 4,
        city varchar(100) 5,
        prop_type varchar(100) 6,
        close_date varchar(100) 8,
        start_bid varchar(100) 9,
        buy_now varchar(100) 13,
        deposit varchar(100) 10,
        sale_type varchar(100) 11
     ) as props


select top 100 * from LDW.Properties



