# FriendsListLife
## Facebook Messages Visualization by year,day and hour
Auteurs : Mehdi Adim & khalid aissi  [Site web](https://mehdiadim.github.io/FriendsListLife/)

### Page Home
<img src="home.PNG" 
alt=""  border="10" />
A short introduction of the developers of this project. a button "See visualization" to see the different visualizations 

### By year and day
<img src="circular.png" 
alt=""  border="10" />

 The goal of this project is to allow you to visualize your own variation of Facebook Messages in your browser, with a nice graphical display that gives insights on the number of messages you send and receive by year, day, and hours.

### By day and hour

<img src="chart.png" 
alt=""  border="10" />
## How does it work ?

First, you should extract your data from Facebook in JSON format [Site](https://www.facebook.com/your_information/). Once you've got your data ready, you can go on the [webSite](https://mehdiadim.github.io/FriendsListLife/).

Use your own file and explore your own data.

# graph by category
<img src="CaptureGraphe.PNG" 
alt=""  border="10" />
In this section we visualize our network on facebook by groups, grouping in relation to the total number of messages exchanged in recent years.
The images displayed are random images, from the randomeUser API.
You can click on any node to view in a heatMap statistics on the number of messages exchanged with this friend since 2016, to return to the graph click anywhere on the heatMap.
the size of the nodes is proportional to the total number of messages exchanged, but given the difference between the total max of messages exchanged by the first and the second person, the difference between the other friends is not visible.
the realization of this graph was inspired by some source: [Source1](http://www.puzzlr.org/force-graphs-with-d3/) [Source2](https://bl.ocks.org/BTKY/cc89fb129fb586475e57febc0fd693bb) 
# heatmap per person
<img src="heatmap.PNG" 
alt=""  border="10" />
The colors reflect the number of messages exchanged per day. 9 colors are used which with a scale that changes from one person to another according to the maximum number of messages exchanged in a day.
