import numpy as np
import pandas as pd

population_url = '/Users/xhonisuli/Desktop/Dataset/zillowApp/population_by_zip.csv'
df = pd.read_csv(population_url)

### DATA ANALYSIS
print(df.describe())
print(df.dtypes)
print(f"Column with missing values: {df.columns[df.isna().any()]}")
print(f"Number of duplicate Zipcode rows: {df.duplicated(subset=["NAME"]).sum()}")

# invalid placeholders
invalid_placeholders = {"?", "na", "n/a", "null", "-", "none", "", "nan", "not available", "unknown"}
placeholders = [np.nan]
for col in df.select_dtypes(include="object"):
  for val in df[col].unique():
    if isinstance(val, str) and val.strip().lower() in invalid_placeholders:
      placeholders.append(val)

placeholders = list(set(placeholders))  # unique placeholders
print(f"Unique placeholders: {placeholders}")
missing = df.isin(placeholders)  # rows with placeholders
print(f"Total values with placeholders: {missing.sum().sort_values(ascending=False)}")

# Rows with at least one missing value
row_missing_count = missing.any(axis=1).sum()
row_missing_frac = row_missing_count / len(df)
print(f"Number of rows with missing values: {row_missing_count}")
print(f"Fraction of rows with missing values: {row_missing_frac}")

print(f"Dataset size: {(df.memory_usage(deep=True).sum() / 1e6):.2f} MB")


### DATA PREPROCESSING - Similar to ROY's implementation

df = df.drop(0)
kept_col = ["GEO_ID", "NAME", "P1_001N"]
df = df[kept_col]

modified_data = df
print(modified_data[~modified_data["P1_001N"].str.isnumeric()])

modified_data.rename(columns={'GEO_ID': 'GeoID', 'NAME': 'ZipCode', 'P1_001N': 'Population'}, inplace=True)

modified_data['ZipCode'] = modified_data['ZipCode'].str.extract(r'(\d{5})')

modified_data['Population'] = pd.to_numeric(modified_data['Population'], errors='coerce')

print(modified_data.head())
modified_data.to_csv("clean_population.csv", index=False)