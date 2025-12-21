# Preprocessing

## How to Read our Preprocessing Scripts

Each `.py`/`.ipynb` file takes a raw CSV dataset as input and outputs a corresponding `clean_csv_files/clean_<entityset>.csv` file that will ultimately be uploaded into that entity set's table in SQL.

⚠️ There are few minor caveats to this rule though:

- The ZipCode table will ultimately get its data from the `clean_zipcode_with_population.csv` file. This file is a join of `clean_zipcode.csv` and `clean_population.csv`, where these 2 CSVs alone do not correspond to any table in our schema.
