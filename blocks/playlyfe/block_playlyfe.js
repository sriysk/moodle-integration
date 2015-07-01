var root= "";

function init_cfg(version, data) {
  root = data.root;
}

/*
  This makes an ajax request to the Playlyfe api through api.php
  @param method the http method of the request can be 'GET', 'POST', 'PATCH', 'DELETE'
  @param route the playlyfe api route you would like to make the request to
  @param body if it a post or patch request the body should be present
*/
function makeApi(method, route, body) {
  body =  body || {};
  return $.ajax({
    type: 'POST',
    url: root+'/blocks/playlyfe/api.php?method='+method+'&route='+route,
    dataType: 'json',
    contentType : 'application/json',
    data: JSON.stringify(body)
  })
  .fail(function (err) {
    console.log(err.responseText);
    err = JSON.parse(err.responseText);
    alert(err.message);
  });
}

/*
  This makes an ajax request to our image upload file and uploads it and returns them image_id in callback
  @param div the div to listen to to display the upload form
  @param type the type of metric being uploaded `point`, `state`
  @param id the id of the metric being uploaded
  @param name optional the name of the state of the state metric being uploaded
  @param cb the callback to trigger when the image is uploaded
*/
function makeUploader(div, type, id, name, cb) {
  var uploader = new plupload.Uploader({
    runtimes : 'html5,',
    browse_button: div, // this can be an id of a DOM element or the DOM element itself
    url: root+'/blocks/playlyfe/image.php?type='+type+'&id='+id+'&name='+name
  });
  uploader.init();
  uploader.bind('FilesAdded', function(up, files) {
    uploader.start();
  });
  uploader.bind('FileUploaded', function(up, file, obj) {
    var response = JSON.parse(obj.response);
    cb(response.image_id);
  });
}

/*
  Displays the point metric in th block
*/
function init_point_block(version, point) {
  $('#pl_point_block').html(
    '<table class="generaltable">' +
      '<thead>' +
        '<tr>' +
          '<th class="header c1 lastcol centeralign">Image</th>' +
          '<th class="header c1 lastcol centeralign">' +
            '<div style="position: relative;">' +
              'Name' +
            '</div>' +
            '</th>' +
        '</tr>'+
      '</thead>' +
      '<tbody>' +
        '<tr>' +
          '<td>' +
            '<img id="point_image" src="' + root + '/blocks/playlyfe/image.php?image_id='+point.image+'&size=small">' +
          '</td>' +
          '<td style="vertical-align: middle;">' +
            '<div style="position: relative;">' +
              '<p id="point_name">'+point.name+'</p>' +
              '<img style="position: absolute;right: 40px;bottom: 5px;" src="'+root+'/theme/image.php/clean/core/1432795487/t/editstring" id="point_edit">' +
            '</div>' +
            '</td>' +
        '</tr>'+
      '</tbody>' +
    '</table>'
  );
  $('#point_edit').click(function(event) {
    var name = prompt('Enter the Point Name', point.name);
    if(name === null) {
      return;
    }
    if (name !== '' && name.length > 2) {
      makeApi('PATCH','/design/versions/latest/metrics/point', {
        type: 'point',
        name: name
      })
      .done(function() {
        $('#point_name').text(name);
        point.name = name;
      });
    }
    else {
      alert('Please Enter a Proper Name for the Point Metric');
    }
  });
  makeUploader('point_image', 'point', 'point', '', function(image_id) {
    $('#point_image').attr("src", root + '/blocks/playlyfe/image.php?image_id='+image_id+'&size=small');
  });
}

/*
  Creates a badge list in the block
*/
function init_badge_list(version, badges) {
  new BadgeList(badges);
}

function BadgeList(badges) {
  this.$el = $('#pl_badge_block');
  this.badges = badges; // the badges collection will hold all our badges
  this.render();
  var self = this;
  this.$el.find('#add_badge').click(function(event) {
    var name = prompt('Enter the Badge Name', "");
    if(name === null) {
      return;
    }
    if (name !== '' && name.length > 2) {
      self.create(name);
    }
    else {
      alert('Please Enter a Proper Name');
    }
  });
}

// Renders the metric list as table with all items and also creates an add button and text
BadgeList.prototype.render = function() {
  var self = this;
  html =
  '<table class="generaltable">' +
    '<thead>' +
      '<tr>' +
        '<th class="header c1 lastcol centeralign">Image</th>' +
        '<th class="header c1 lastcol centeralign">' +
          '<div style="position: relative;">' +
            'Name' +
            '<img style="position: absolute;right: 40px;bottom: 5px;" src="'+root+'/theme/image.php/clean/core/1432795487/t/add" id="add_badge">' +
          '</div>' +
        '</th>' +
      '</tr>'+
    '</thead>' +
    '<tbody>' +
    '</tbody>' +
  '</table>';
  self.$el.html(html);
  for(var i=0;i<this.badges.length;i++) {
    (function(badge) {
      self.$el.find('table tbody').append(
        '<tr>' +
          '<td>' +
            '<img id="'+badge.id+'_image" src="' + root + '/blocks/playlyfe/image.php?image_id='+ badge.image + '&size=small">' +
          '</td>' +
          '<td style="vertical-align: middle;">' +
            '<div style="position: relative;">' + badge.name +
              '<img style="position: absolute;right: 40px;" src="'+root+'/theme/image.php/clean/core/1432795487/t/editstring" id="'+badge.id+'_edit">' +
              '<img style="position: absolute;right: 0px;" src="'+root+'/theme/image.php/clean/core/1432795487/t/delete" id="'+badge.id+'_delete">' +
            '</div>' +
          '</td>' +
        '</tr>'
      );
      self.$el.find('#'+badge.id+'_edit').click(function(){ self.update(badge); });
      self.$el.find('#'+badge.id+'_delete').click(function(){ self.remove(badge); });
      makeUploader(badge.id+'_image', 'point', badge.id, '', function(image_id) {
        self.getBadge(badge.id).image = image_id;
        self.render();
      });
    })(this.badges[i]);
  }
}

// This gets a badge from the badge collection when given the badge id
BadgeList.prototype.getBadge = function(id) {
  for(var i=0;i<this.badges.length;i++) {
    if(this.badges[i].id === id) {
      return this.badges[i];
    }
  }
}

// Create's a new badge by making an post request and then adds it to this list
BadgeList.prototype.create = function(name) {
  var self = this;
  makeApi('POST', '/design/versions/latest/metrics', {
    id: 'b_'+name,
    name: name,
    type: 'point',
    constraints: {
      'default': '0',
      'max': 'Infinity',
      'min': '0'
    },
    'tags': ['badge']
  })
  .done(function (data) {
    self.badges.push(data);
    self.render();
  });
}

// Updates a badge by making a patch request
BadgeList.prototype.update = function(badge) {
  var self = this;
  var new_name = prompt("Enter the new name", badge.name);
  if (new_name !== null && new_name !== '' && new_name.length > 2 && new_name !== badge.name) {
    makeApi('PATCH','/design/versions/latest/metrics/'+badge.id, {
      type: 'point',
      name: new_name
    })
    .done(function() {
      self.getBadge(badge.id).name = new_name;
      self.render();
    });
  }
}

// Removes a badge by making a delete request and removes it from the list
BadgeList.prototype.remove = function(badge) {
  var self = this;
  var result = confirm("Do you really want to delete "+badge.name + '?');
  if(result) {
    makeApi('DELETE', '/design/versions/latest/metrics/'+badge.id)
    .done(function (data) {
      for(var i=0;i<self.badges.length;i++) {
        if(self.badges[i].id === badge.id) {
          self.badges.splice(i, 1);
        }
      }
      self.render();
    });
  }
}

/*
  Creates a new LevelList Object
*/
function init_level_list(version, data) {
  new LevelList(data);
}

function LevelList(data) {
  this.$el = $('#pl_level_block');
  this.names = {};
  // This is used to index states by name later for lookup
  for(var i=0;i<data.state.constraints.states.length;i++) {
    var state = data.state.constraints.states[i];
    this.names[state.name] = state;
  }
  this.rule = data.rule;
  this.base = data.base.name;
  this.stack = [];
  this.render();
}

// Renders the metric list as table with all items and also creates an add button and text
LevelList.prototype.render = function() {
  var self = this;
  html =
  '<table class="generaltable">' +
    '<thead>' +
      '<tr>' +
        '<th class="header c1 lastcol centeralign" style="" scope="col">Image</th>' +
        '<th class="header c1 lastcol centeralign" style="" scope="col">Name</th>' +
        '<th class="header c1 lastcol centeralign" style="" scope="col">To</th>' +
      '</tr>'+
    '</thead>' +
  '<tbody>' +
  '</tbody>' +
  '</table>' +
  '<label for="level_name">Attain Level : </label><input id="level_name" type="text"></input>' +
  '<label for="level_to">When '+this.base+' is within : </label>' +
  'Max: <input id="level_to" type="number" value="0" style="width: 50px;">' +
  '<button id="add_level">Add Level</button>';
  this.$el.html(html);
  $('#add_level').click(function(event) {
    var name = $('#level_name').val();
    $('#level_name').val('');
    var to = $('#level_to').val();
    if(name) {
      if (name !== '' && name.length > 2) {
        self.create(name, to);
      }
      else {
        alert('Please Enter a Proper Name');
      }
    }
  });
  var self = this;
  for(var i=0;i<this.rule.levels.length;i++) {
    (function(level) {
      var rank = level.rank;
      self.$el.find('table tbody').append(
        '<tr>' +
          '<td>' +
            '<img id="level_'+rank+'" src="' + root + '/blocks/playlyfe/image.php?image_id='+ self.names[rank].image + '&size=small">' +
          '</td>' +
          '<td style="vertical-align: middle;">' +
            rank +
          '</td>' +
          '<td style="vertical-align: middle;">' +
            '<div style="position: relative;">'+
              '<p>' + (level.threshold || 'Infinity') + '</p>' +
              '<img style="position: absolute;right: 0px;bottom: 5px;" src="'+root+'/theme/image.php/clean/core/1432795487/t/delete" id="'+rank+'_delete">' +
            '</div>' +
          '</td>' +
        '</tr>'
      );
      makeUploader('level_'+rank, 'state', 'level', rank, function(image_id) {
        self.names[rank].image = image_id;
        self.render();
      });
      // We check if atleast 2 levels are present. If not then we throw an alert message.
      // And then we remove that particular level from both the state metric and level rule and do the save
      $('#'+rank+'_delete').click(function(){
        if(self.rule.levels.length <= 2) {
          alert('You need to have atleast minimum 2 levels');
          return;
        }
        var result = confirm("Do you really want to delete  the Level `"+ rank + '`?');
        if(result) {
          delete self.names[rank];// remove from the state metric
          for(var i=0;i<self.rule.levels.length;i++) {
            level = self.rule.levels[i];
            if(rank === level.rank) {
              self.rule.levels.splice(i, 1); // remove from the levels
              break;
            }
          }
          self.save();
        }
      });
    })(this.rule.levels[i]);
  }
}

// This creates a new level i.e. create a new state and a new condition to assign the state if the player reaches the score
LevelList.prototype.create = function(name, value) {
  if(this.names[name]) { // Don't create levels with same name
    alert('You have already defined a level with this name');
    return;
  }
  // Don't create levels with lower score than previous one
  var prev_value = parseInt(this.rule.levels[this.rule.levels.length-2].threshold);
  if(prev_value > value) {
    alert('You need to pass a higher value than the 2nd last level');
    return;
  }
  var self = this;
  var last = this.rule.levels.pop();
  last.threshold = value; // change threshold of last level
  this.rule.levels.push(last);
  this.rule.levels.push({rank: name }); // add the new level
  self.names[name] =  { name: name, image: 'default-state-metric' }; // add the new state
  this.save();
}

// This saves the state metric and the level metric
LevelList.prototype.save = function() {
  var self = this;
  new_states = [];
  for(var name in this.names){
    new_states.push({name: name, image: this.names[name].image });
  }
  makeApi('PATCH', '/design/versions/latest/metrics/level', {
    type: 'state',
    constraints: {
      'states': new_states
    }
  })
  .done(function() {
    makeApi('PATCH', '/design/versions/latest/rules/level', {
      type: 'level',
      levels: self.rule.levels
    })
    .done(function() {
      self.render()
    });
  });
}

/*
  Creates a new RuleList Object
*/
function init_rule_list(version, data) {
  var ruleList = new RuleList(data.rule, data.point, data.badges);
}

function RuleList(rule, point, badges) {
  this.id = 'pl_'+rule.id+'_block';
  this.$el = $('#'+this.id);
  this.rule = rule;
  this.rewards = [];
  this.point = point;
  this.point.value = '0';
  this.badges = badges;
  this.count = 0;
  this.render();
  for(var i=0;i<rule.rules[0].rewards.length;i++) {
    var reward = rule.rules[0].rewards[i];
    if(reward.metric.id === this.point.id) {
      $('#'+this.id+'_point_value').val(reward.value);
      continue;
    }
    this.add(reward.metric.id, reward.value);
  }
}

RuleList.prototype.render = function() {
  html =
  '<div>' +
    '<p>How many '+this.point.name+' Points would you like to reward?</p>' +
    '<input id="'+this.id+'_point_value" type="number" value="0"></input>' +
  '</div>' +
  '<div>' +
    '<p>What Badges would you like to reward?</p>' +
  '</div>' +
  '<table id="'+this.id+'_table" class="generaltable">' +
    '<thead>' +
      '<tr>' +
        '<th class="header c1 lastcol centeralign" style="" scope="col">Metric</th>' +
        '<th class="header c1 lastcol centeralign" style="" scope="col">Value</th>' +
      '</tr>'+
    '</thead>' +
  '<tbody>' +
  '</tbody>' +
  '</table>';
  html += '<select id="'+this.id+'_select">';
  for(var i=0;i<this.badges.length;i++) {
    var metric = this.badges[i];
    html += '<option class="text-left" value="'+metric.id+'">'+metric.name+'</option>';
  }
  html += '</select><input style="width:60px;" id="'+this.id+'_value" type="number" value="1"></input><button id="'+this.id+'_add">Add</button><button id="'+this.id+'_save">Save</button>';
  this.$el.html(html);
  var self = this;
  $('#'+self.id+'_add').click(function() {
    var metric = $('#'+self.id+'_select').val();
    var value = $('#'+self.id+'_value').val();
    if(metric) {
      self.add(metric, value);
    }
  });
  $('#'+this.id+'_save').click(function() {
    self.save(self);
  });
}

RuleList.prototype.add = function(id, value) {
  this.count++;
  var tag_id = this.id+'_'+this.count;
  this.$el.find('#'+this.id+'_table tbody').append(
    '<tr id="'+tag_id+'_row">' +
      '<td>' +
        id +
      '</td>' +
      '<td style="vertical-align: middle;">' +
        '<div style="position: relative;">'+
          value +
          '<img style="position: absolute;right: 0px;bottom: 5px;" src="'+root+'/theme/image.php/clean/core/1432795487/t/delete" id="'+tag_id+'_delete">' +
        '</div>' +
      '</td>' +
    '</tr>'
  );
  this.addReward(id, value);
  var self = this;
  $('#'+tag_id+'_delete').click(function(){
    $('#'+tag_id+'_row').remove();
    self.removeReward(id);
  });
}

// adds a reward to rewards list
RuleList.prototype.addReward = function(id, value) {
  for(var i=0;i<this.rewards.length;i++) { // If its already there update it
    if (this.rewards[i].metric.id === id) {
      this.rewards[i].value = value;
      return;
    }
  }
  this.rewards.push({ // otherwise push it
    metric: {
      id: id,
      type: 'point'
    },
    verb: 'add',
    value: value
  })
  $('#'+this.id+'_select option[value="'+id+'"]').remove(); // remove metric from list
}

// removes a reward to rewards list
RuleList.prototype.removeReward = function(id) {
  for(var i=0;i<this.rewards.length;i++) {
    if (this.rewards[i].metric.id === id) {
      this.rewards.splice(i, 1);
      this.$el.find('#'+this.id+'_select')
      .append('<option class="text-left" value="'+id+'">'+id+'</option>');
      break;
    }
  }
}

// Makes an ajax request to save the rewards
RuleList.prototype.save = function(self) {
  var points = $('#'+self.id+'_point_value').val();
  self.addReward(self.point.id, points);
  makeApi('PATCH', '/design/versions/latest/rules/'+self.rule.id, {
    type: 'custom',
    rules: [
      {
        rewards: self.rewards,
        requires: {}
      }
    ]
  })
  .done(function() {
    alert('Saved Successfully');
  });
}

/*
  Displays the user profile
*/
function show_profile(version, data) {
  var profile = data.profile;
  var notifications = data.notifications;
  $('#pl_profile_block').html(
    '<h5>'+profile.alias+'</h5>' +
    '<p id="point_placeholder"> You dont have any points </p>' +
    '<table id="pl_profile_point" class="generaltable">' +
      '<tbody>'  +
      '</tbody>' +
    '</table>' +
    '<table id="pl_profile_level" class="generaltable">' +
      '<tbody>'  +
      '</tbody>' +
    '</table>' +
    '<b>Badges</b>' +
    '<p id="badge_placeholder"> You havent got any badges yet do something </p>' +
    '<table id="pl_profile_badges" class="generaltable">' +
      '<tbody>'  +
      '</tbody>' +
    '</table>'
  );
  var point = null;
  for(var i=0;i < profile.scores.length; i++) {
    var score = profile.scores[i];
    if(score.metric.id === 'point') {
      $('#point_placeholder').remove();
      point = score;
      $("#pl_profile_point tbody").append(
        '<tr style="vertical-align: middle;">' +
          '<td><p><img src="' + root + '/blocks/playlyfe/image.php?metric_id=point"></td>' +
          '<td><b>'+ score.metric.name+' </b><p>'+score.value+'</p></p></td>' +
        '</tr>'
      );
    } else if (score.metric.type === 'state') {
      if(score.meta.next){
        $("#pl_profile_level tbody").append(
          '<tr style="vertical-align: middle;">' +
            '<td><p><img src="' + root + '/blocks/playlyfe/image.php?metric_id=level&state='+score.value.name+'"></td>' +
            '<td><b>' + score.value.name + '</b><p>' + 'You need ' + (parseInt(score.meta.high) - parseInt(point.value)) + ' ' + score.meta.base_metric.name +' points to get to <b>' + score.meta.next + '</b></p></p></td>' +
          '</tr>'
        );
      } else {
       $("#pl_profile_level tbody").append(
        '<tr style="vertical-align: middle;">' +
          '<td><p><img src="' + root + '/blocks/playlyfe/image.php?metric_id=level&state='+score.value.name+'"></td>' +
          '<td><b>'+score.value.name+'</b><p> You are at the Highest Level</p></p></td>' +
        '</tr>'
       );
     }
    } else {
      $('#badge_placeholder').remove();
      $('#pl_profile_badges tbody').append(
        '<tr style="vertical-align: middle;">' +
          '<td><img src="' + root + '/blocks/playlyfe/image.php?metric_id='+score.metric.id+'"></td>' +
          '<td>' + score.metric.name + '</td>' +
          '<td>' + score.value + '</td>' +
        '</tr>'
      );
    }
  }
  $('#pl_notification_block').html(
    '<h5>Activity</h5>' +
    '<ul>' +
    '</ul>'
  );
  if(notifications && notifications.length > 0) {
    show_feedback(notifications);
  }
}

var dialog_open = false;
var notification_ids = [];
function show_feedback(logs) {
  log = logs.pop()
  notification_ids.push(log.id);
  var btnText = "Next";
  if(logs.length === 0) {
    btnText = "OK";
  }
  var html = '';
  for(var j=0;j < log.changes.length;j++) {
    var change = log.changes[j];
    if(change.metric.id == 'point') {
      html +=  '<div><div class="image avatar"><img src="' + root + '/blocks/playlyfe/image.php?metric_id='+change.metric.id+'"></img></div>' +
        '<p>You have gained <b>'+(change.delta['new']-change.delta['old'])+'</b> '+change.metric.name+' Points </p></div>';
    }
    else if(change.metric.type == 'state') {
      html += '<div><div class="image avatar"><img src="' + root + '/blocks/playlyfe/image.php?metric_id='+change.metric.id+'&state='+change.delta['new']+'"></img></div>' +
        '<p>You have gained '+change.metric.name+' <b>'+(change.delta['new'])+'</b></p></div>';
    }
    else {
      html += '<div><div class="image avatar"><img src="' + root + '/blocks/playlyfe/image.php?metric_id='+change.metric.id+'"></img></div>' +
        '<p>You have gained <b>'+(change.delta['new']-change.delta['old'])+'</b> '+change.metric.name+' Badge </p></div>';
    }
    html += '<div style="clear: both;"></div>';
  }
  if(dialog_open === false) {
    $("#pl_dialog").dialog({
      dialogClass: "no-close",
      closeOnEscape: false,
      position: { my: "center", at: "center", of: "body" },
      height: "300",
      width: "500",
      modal: true,
      buttons: [
        {
          text: btnText,
          click: function() {
            if(logs.length === 0) {
              makeApi('POST', '/runtime/notifications', { ids: notification_ids });
              $(this).dialog("close");
              dialog_open = false;
            }
            else {
              show_feedback(logs);
            }
          }
        }
      ]
    });
    dialog_open = true;
  }
  $("#ui-id-1").html(log.title);
  $("#pl_dialog").html(html);
  $('.ui-dialog').css("top","20%");
}

/*
  Displays the point leaderboard
*/
function show_leaderboard(version, leaderboard) {
  var players = '';
  for(var i=0;i<leaderboard.data.length;i++) {
    var item = leaderboard.data[i];
    players += '<tr><td>' + item.rank + '</td><td>' + item.player.alias + '</td><td>' + item.score + '</td>';
  }
  $('#pl_leaderboard').html(
    '<table class="generaltable">' +
      '<thead>' +
        '<tr>' +
          '<th class="header c1 lastcol centeralign" style="" scope="col">Rank</th>' +
          '<th class="header c1 lastcol centeralign" style="" scope="col">Name</th>' +
          '<th class="header c1 lastcol centeralign" style="" scope="col">Score</th>' +
        '</tr>' +
      '</thead>' +
      '<tbody>' +
        players +
      '</tbody>' +
    '</table>'
  );
}
