function read_files(files){
  
    var messages_array = [];
    var count_init = 0;
    var count_end = 0;
  
  var cnt_reset = 0;
    for (var i = 0; i < files.length; i++) {
      (function(file, i) {
        if (file.webkitRelativePath.endsWith("message.json")){
          count_init += 1
          var reader = new FileReader()
          reader.onloadend = function(){
              thread = JSON.parse(reader.result)
  
            thread_info = {
              'is_still_participant': thread['is_still_participant'],
              'thread_type': thread['thread_type'],
              'thread': decodeURIComponent(escape(thread['title'])),
            }
            try {
              thread_info['nb_participants'] = thread['participants'].length
            } catch {
              thread_info['nb_participants'] = 0
            }
  
            thread_messages = thread['messages']
            for (var i=0; i<thread_messages.length; i++){
              message = thread_messages[i]
              message_info = {
                'sender_name': decodeURIComponent(escape(message['sender_name'])),
                'timestamp': message['timestamp'] || (message['timestamp_ms'] / 1000),
                'type': message['type'],
              }
  
  
              messages_array.push(Object.assign({}, message_info, thread_info));
            }
            count_end += 1 
            if (count_init == count_end){ 
              
             
               
              date_debut = new Date("2016-1-1")
              
             
              
              function toDate(date){
              
                year = date.getFullYear().toString()
                month = date.getMonth()+1
                day = date.getDate()
                
                return year+"-"+month+"-"+day
              }
  
              data = []
              obj = {}
              obj.date = toDate(date_debut)
              obj.received = 0
              obj.sent = 0
              obj.allDayReceived = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              obj.allDaySent =[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              data[0] = obj
              for (var i = 1; i < 1147; i++) {
                            nextDay = new Date(data[i-1].date)
                  .setDate(new Date(data[i-1].date).getDate() + 1);
                obj={}
                obj.date = toDate(new Date(nextDay))
                obj.received = 0
              obj.sent = 0
              obj.allDayReceived = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              obj.allDaySent =[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                data[i] = obj 
                          }
               
             console.log(data) 
           
              
              msgs = messages_array;
             
              msgs.forEach(function(item, index, array) {
            
            date = new Date(item.timestamp*1000)
            hour = date.getHours() - 1
            if(hour == -1){
              hour = 23
            }
                    date_str = toDate(date);
            
            
              data.forEach(function(line, i){
                
                if(line.date == date_str){
                  
                if(item.sender_name == item.thread){
                  // Received
                  line.received += 1/2
                  line.allDayReceived[hour] +=1/2
                }
                  else{
                    // Sent
                    line.sent += 1/2
                  line.allDaySent[hour] +=1/2
                    
                  }
                  
                }
              })
              
              }) 
                   
             data.forEach(function(line, i){
               
               all_rec =''
               all_sent = ''
                for (var i = 1; i < 24; i++) {
                  if (i == 23){
                  all_rec += line.allDayReceived[i] 
                  all_sent += line.allDaySent[i] 
                  }
                  else{
                   all_rec += line.allDayReceived[i] + "-"
                    all_sent += line.allDaySent[i]+ "-"
                  }
                  
                } 
               line.allDayReceived = all_rec
               line.allDaySent = all_sent
  //              console.log(line.date +","
  //                          +line.received +","
  //                         + line.sent+","
  //                         +all_rec+","
  //                         +all_sent)
               
             })
             
             
             data.columns = ["date", "received", "sent", "allDayReceived", "allDaySent"]
             ///////////////////////////////////////////
             ///////////////////////////////////////////
             
              console.log(data)
              loadViz(data)
            }
          }
          reader.readAsText(file)
        }
      })(files[i], i);
    }
  }