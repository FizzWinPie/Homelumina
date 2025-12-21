import pandas as pd

df = pd.read_csv(
    "zip_code_database.csv",
    # zip column must be read as string to not remove leading 0s
    converters={ "zip": str.strip, "primary_city": str.strip, "state": str.strip }
)


# Maps columns from original CSV to the attributes for ZipCode table
column_mapping = {
    "zip": "ZipCode",
    "latitude": "Latitude",
    "longitude": "Longitude",
    "primary_city": "City",
    "state": "State"
}

# Filters out all columns not in the column mapping (we don't need them for ZipCode table)
df_filtered = df[list(column_mapping.keys())]

# Renames the columns in the column mapping
df_renamed = df_filtered.rename(columns=column_mapping)

# Population column will be populated by a separate dataset, so we pad with NULL for the time being
df_renamed["Population"] = pd.NA

df_renamed.to_csv("clean_zipcode.csv", index=False)
print("Created clean_zipcode.csv file")