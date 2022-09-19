-- how many properties
select count(*) 
from LDW.Properties where name_ is not null;

-- no. of properties per city
select distinct city, count(city) as city_count, avg(cast(start_bid as float)) as avg_bid
from LDW.Properties
group by city
order by city_count desc;

-- no. of properties per region
select distinct region, count(region) as region_count, avg(cast(start_bid as float)) as avg_bid
from LDW.Properties
group by region
order by region_count desc;

-- no. of properties per property type
select distinct prop_type, count(prop_type) as ptype_count, avg(cast(start_bid as float)) as avg_bid
from LDW.Properties
group by prop_type
order by ptype_count desc;

-- no. of properties per property type
select distinct sale_type, count(region) as stype_count, avg(cast(start_bid as float)) as avg_bid
from LDW.Properties
group by sale_type
order by stype_count desc;






