# wmata-app

api key = 8735e3d470f44dc6abca0e456bc197d5

two form submissions:
1, user selections source and destintion station. gets data from API to display on webpage (railtime, rail fairs, total miles)
2, source is college park and user selects destintion, get preexisting data from mongodb, display same data as above


form(api) - filter from source to destination station: show railtime, rail fairs, total miles

form/mongodb - filter from cp to any other station, show same data but get data from mongodb so API isn't used (got from manually getting data in advance (98 total entries))

for stations, use drop down for input
