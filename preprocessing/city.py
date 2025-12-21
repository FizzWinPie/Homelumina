import pandas as pd

# Reads input dataset, making sure to strip any whitespace while reading it in
df = pd.read_csv("zip_code_database.csv", converters={ "primary_city": str.strip, "state": str.strip })

formatted_df = df[["primary_city", "state"]].rename(columns={ "primary_city": "Name", "state": "State" })

# Removes any duplicate rows to ensure each row's primary key is guaranteed to be unique
results_df = formatted_df.drop_duplicates()

results_df.to_csv("clean_city.csv", index=False)

print("Created clean_city.csv file")