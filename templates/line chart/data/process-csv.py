import json
import csv
data = []
i = 0
inputFile = 'data'
outputFile = 'data'

#### IMPORT CSV ####
with open(inputFile + '.csv', 'rb') as csvFile:
	temp = csv.reader(csvFile, delimiter=',');
	for row in temp:
		data.insert(i, row)
		i += 1

#### EXPORT JSON ####
with open(outputFile + '.json', "w") as file:
	json.dump(data, file)
	
