var app  = {
  
  
  server: 'https://api.parse.com/1/classes/chatterbox',
  friends: { },
  room: 'lobby',

  init: function (){
    $('body').off('click.addFriend').on('click.addFriend', '.username', function(){
      app.addFriend($(this).text());
    });

    $('body').off('click.handleSubmit').on('submit.handleSubmit', '#send .submit', function(e){
      e.preventDefault();
      app.handleSubmit($(this).text());
    });

    app.fetch();
    
    setInterval(app.fetch, 3000);
  },

  fetch:  function(){
    $.ajax({
      url: app.server,
      type: 'GET',
      contentType: 'application/json',
      success: function (data) {
        app.addToRooms(data.results);

        app.addToMessages(data.results);

        console.log('chatterbox: Message sent. Data: ', data);
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message. Error: ', data);
      }
    });
  },

  send: function(message){
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {

        console.log('chatterbox: Message sent. Data: ', data);
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message. Error: ', data);
      }
      // TODO After sending, do we want to auto-fetch?...although I think
      // that would go in handleSubmit() instead of here
   });
  },

  addToRooms: function(messages){
    $('#roomSelect').html('<option value="newRoom">New Room...</option><option value="lobby" selected>Lobby</option>');
    if (!Array.isArray(messages)){
      return;
    }
    var processedRooms = {};

    messages.forEach(function(message){
      var roomname = message.roomname;

      if (roomname && !processedRooms[roomname]){
        app.addRoom(roomname);
        processedRooms[roomname] = true;
      }
    });
   
    $('#roomSelelect').val(app.room);
    // FROM ZACH: This fetch seems redundant to me...creates an infinite loop
    // between fetch() and addToRooms()
    // app.fetch();
  },

   clearMessages: function(){
    $('#chats').children().remove();
  },

  addToMessages: function(results){
    app.clearMessages();
    if(Array.isArray(results)){
      results.forEach(app.addMessage);
    }
  },

  addMessage: function(data){
   if(!data.roomname){
      data.roomname = 'lobby';
    }
    if(data.roomname === app.room){
      var $chat = $('<div class="chat" />');

      var $username = $('<span class="chat" />');
      $username.text(data.username + ': ').attr('data-username', data.username).appendTo($chat);

      var $message = $('<br /><span />');
      $message.text(data.text).appendTo($chat);

      $('#chats').append($chat);
    }

    //trying something out here 
    // var chat = '<div class="chat">' +
    //              '<div class="username">' + message.username '</div>' +
    //              '<div>' + message.text + '</div>' +
    //            '</div>';
    
    // $('#chats')').prepend(chat);
  },

  addRoom: function(roomname){
    // FROM ZACH: I was wrong. We are getting a jQuery object, so I added back
    // the "$" to our variable name.
    // Do we want to be able to handle room names with spaces and other things
    // that might cause problems with the option value attr    
    var $roomOption = $('<option />').val(roomname).text(roomname);
 
    $('#roomSelect').append($roomOption);
  },

  addFriend: function(friendName){
    // FROM ZACH: I added this
    app.friends[friendName] = true;
  },

  handleSubmit: function(){
    event.preventDefault();

    var message = {
      username: app.username,
      roomname: app.room || 'lobby';
      text: app.$message.val();

    };
    app.send(message);
  }
  };



