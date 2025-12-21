import pandas as pd

clean_zipcode = pd.read_csv("clean_zipcode.csv")
clean_population = pd.read_csv("clean_population.csv")[["ZipCode", "Population"]]

# Join Population column from clean_population into clean_zipcode
clean_zipcode_with_population = clean_zipcode.drop(columns=["Population"], errors="ignore").merge(
    clean_population, on="ZipCode", how="left"
)

clean_zipcode_with_population.to_csv("clean_zipcode_with_population.csv", index=False)
print("Created clean_zipcode_with_population.csv file")