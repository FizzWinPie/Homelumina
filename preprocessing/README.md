# Preprocessing

## How to Read our Preprocessing Scripts

Each `.py`/`.ipynb` file takes a raw CSV dataset as input and outputs a corresponding `clean_csv_files/clean_<entityset>.csv` file that will ultimately be uploaded into that entity set's table in SQL.

⚠️ There are few minor caveats to this rule though:

- The ZipCode table will ultimately get its data from the `clean_zipcode_with_population.csv` file. This file is a join of `clean_zipcode.csv` and `clean_population.csv`, where these 2 CSVs alone do not correspond to any table in our schema.

`final_clean_csv`is after removing ',' of `clean_realtor.csv` with grep

USED:
1) clean_childcare
2) clean_city
3) clean_firefighter
4) clean_healthmeasure
5) clean_hospital
6) clean_mean_income
7) clean_police
8) final_clean (real estate)
9) clean_zipcode_with_population