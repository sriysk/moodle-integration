var root= "";

function init_cfg(version, data) {
  root = data.root;
}

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
            '<img src="' + root + '/blocks/playlyfe/image.php?image_id=default-point-metric&size=small">' +
          '</td>' +
          '<td style="vertical-align: middle;">' +
            '<div style="position: relative;">' +
              '<p id="point_name">'+point.name+'</p>' +
              '<img style="position: absolute;right: 40px;bottom: 5px;" src="http://localhost:3000/theme/image.php/clean/core/1432795487/t/editstring" id="point_edit">' +
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
      });
    }
    else {
      alert('Please Enter a Proper Name for the Point Metric');
    }
  });
}

/*
  Creates a badge list in the block
*/
function init_badge_list(version, badges) {
  var badgeList = new BadgeList();
  badgeList.render();
  for(var i=0;i<badges.length;i++) {
    badgeList.add(badges[i]);
  }
}

/*
  Creates a new BadgeList Object
*/
function BadgeList() {
  this.id = 'pl_badge_block';
  this.image = 'default-set-metric';
  this.$el = $('#pl_badge_block');
}

// Renders the metric list as table with all items and also creates an add button and text
BadgeList.prototype.render = function() {
  html =
  '<table id="'+this.id+'_table" class="generaltable">' +
    '<thead>' +
      '<tr>' +
        '<th class="header c1 lastcol centeralign">Image</th>' +
        '<th class="header c1 lastcol centeralign">' +
          '<div style="position: relative;">' +
            'Name' +
            '<img style="position: absolute;right: 40px;bottom: 5px;" src="http://localhost:3000/theme/image.php/clean/core/1432795487/t/add" id="'+this.id+'_add">' +
          '</div>' +
        '</th>' +
      '</tr>'+
    '</thead>' +
  '<tbody>' +
  '</tbody>' +
  '</table>';
  this.$el.html(html);
  var self = this;
  $('#'+this.id+'_add').click(function(event) {
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

// Create's a new badge by making an post request and then adds it to this list
BadgeList.prototype.create = function(name) {
  var self = this;
  makeApi('POST', '/design/versions/latest/metrics', {
    id: name,
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
    self.add(data);
  });
}

// This will add a badge to this list
BadgeList.prototype.add = function(badge) {
  var self = this;
  this.$el.find('#'+this.id+'_table tbody').append(
    '<tr id="'+badge.id+'_row">' +
      '<td>' +
        '<img src="' + root + '/blocks/playlyfe/image.php?image_id='+ this.image + '&size=small">' +
      '</td>' +
      '<td style="vertical-align: middle;">' +
        '<div id="'+badge.id+'_name" style="position: relative;">'+
          badge.name +
          '<img style="position: absolute;right: 40px;" src="http://localhost:3000/theme/image.php/clean/core/1432795487/t/editstring" id="'+badge.id+'_edit">' +
          '<img style="position: absolute;right: 0px;" src="http://localhost:3000/theme/image.php/clean/core/1432795487/t/delete" id="'+badge.id+'_delete">' +
        '</div>' +
      '</td>' +
    '</tr>'
  );
  $('#'+badge.id+'_edit').click(function(){ self.update(badge); });
  $('#'+badge.id+'_delete').click(function(){ self.remove(badge); });
}

// Updates a badge by making a patch request
BadgeList.prototype.update = function(badge) {
  var new_name = prompt("Enter the new name", badge.name);
  if (new_name !== null && new_name !== '' && new_name.length > 2 && new_name !== badge.name) {
    makeApi('PATCH','/design/versions/latest/metrics/'+badge.id, {
      type: 'point',
      name: new_name
    })
    .done(function() {
      $('#'+badge.id+'_name').text(new_name);
    });
  }
}

// Removes a badge by making a delete request and removes it from the list
BadgeList.prototype.remove = function(badge) {
  var result = confirm("Do you really want to delete "+badge.name + '?');
  if(result) {
    makeApi('DELETE', '/design/versions/latest/metrics/'+badge.id)
    .done(function (data) {
      $('#'+badge.id+'_row').remove();
      alert("Metric "+badge.name+' was deleted Successfully');
    });
  }
}

/*
  Creates a new LevelList Object
*/
function init_level_list(version, data) {
  var levelList = new LevelList(data);
  levelList.render();
  for(var i=0;i<data.rule.levels.length;i++) {
    levelList.add(data.rule.levels[i].rank, data.rule.levels[i].threshold);
  }
}

function LevelList(data) {
  this.id = 'pl_level_block';
  this.image = 'default-state-metric';
  this.$el = $('#pl_level_block');
  this.levels = [];
  this.rule = data.rule;
  this.base = data.base.name;
  this.stack = [];
}

// Renders the metric list as table with all items and also creates an add button and text
LevelList.prototype.render = function() {
  html =
  '<table id="'+this.id+'_table" class="generaltable">' +
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
  var self = this;
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
}

LevelList.prototype.add = function(name, value) {
  this.levels.push(name);
  var self = this;
  this.$el.find('#'+this.id+'_table tbody').append(
    '<tr id="'+name+'_row">' +
      '<td>' +
        '<img src="' + root + '/blocks/playlyfe/image.php?image_id='+ this.image + '&size=small">' +
      '</td>' +
      '<td style="vertical-align: middle;">' +
        name +
      '</td>' +
      '<td style="vertical-align: middle;">' +
        '<div style="position: relative;">'+
          '<p id="'+name+'_edit">' + (value || 'Infinity') + '</p>' +
          '<img style="position: absolute;right: 0px;bottom: 5px;" src="http://localhost:3000/theme/image.php/clean/core/1432795487/t/delete" id="'+name+'_delete">' +
        '</div>' +
      '</td>' +
    '</tr>'
  );
  $('#'+name+'_delete').click(function(){
    if(self.levels.length <= 2) {
      alert('You need to have atleast minimum 2 levels');
      return;
    }
    var result = confirm("Do you really want to delete  the Level `"+ name + '`?');
    if(result) {
      self.levels.splice(self.levels.indexOf(name), 1);
      new_states = [];
      for(var i=0;i<self.levels.length;i++) {
        new_states.push({name: self.levels[i], image: 'default-state-metric' });
      }
      for(var i=0;i<self.rule.levels.length;i++) {
        level = self.rule.levels[i];
        if(name === level.rank) {
          self.rule.levels.splice(i, 1);
          break;
        }
      }
      makeApi('PATCH', '/design/versions/latest/metrics/level', {
        type: 'state',
        constraints: {
          'states': new_states
        }
      })
      .done(function () {
        makeApi('PATCH', '/design/versions/latest/rules/level', {
          type: 'level',
          levels: self.rule.levels
        })
        .done(function () {
          $('#'+name+'_row').remove();
        });
      });
    }
  });
}

LevelList.prototype.create = function(name, value) {
  if(this.levels.indexOf(name) > -1) { // Don't create levels with same name
    alert('You have already defined a level with this name');
    return;
  }
  var prev_value = parseInt(this.rule.levels[this.rule.levels.length-2].threshold); // Don't create levels with lower score than previous one
  if(prev_value > value) {
    alert('You need to pass a higher value than the 2nd last level');
    return;
  }
  var self = this;
  var new_states = [ {name: name, image: 'default-state-metric' } ];
  for(var i=0;i<this.levels.length;i++) {
    new_states.push({name: this.levels[i], image: 'default-state-metric' });
  }
  var last = this.rule.levels.pop();
  last.threshold = value;
  this.rule.levels.push(last);
  this.rule.levels.push({rank: name });
  makeApi('PATCH', '/design/versions/latest/metrics/level', {
    type: 'state',
    constraints: {
      'states': new_states
    }
  })
  .done(function () {
    makeApi('PATCH', '/design/versions/latest/rules/level', {
      type: 'level',
      levels: self.rule.levels
    })
    .done(function () {
      $('#'+last.rank+'_edit').text(''+value);
      self.add(name, null)
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
          '<img style="position: absolute;right: 0px;bottom: 5px;" src="http://localhost:3000/theme/image.php/clean/core/1432795487/t/delete" id="'+tag_id+'_delete">' +
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
function show_profile(version, profile) {
  $('#pl_profile_block').html(
    '<h5>'+profile.alias+'</h5>' +
    '<div id="pl_profile_point"></div>' +
    '<div id="pl_profile_level"></div>' +
    '<b>Badges</b>' +
    '<table id="pl_profile_badges" class="generaltable">' +
      '<tbody>' +
      '</tbody>' +
    '</table>'
  );
  var point = null;
  for(var i=0;i < profile.scores.length; i++) {
    var score = profile.scores[i];
    if(score.metric.id === 'point') {
      point = score;
      $("#pl_profile_point").html(
        '<img src="' + root + '/blocks/playlyfe/image.php?image_id=default-point-metric&size=small">' +
        '<b>'+score.metric.name+' </b>' + score.value
      );
    } else if (score.metric.type === 'state') {
      $("#pl_profile_level").html(
        '<p><img src="' + root + '/blocks/playlyfe/image.php?image_id=default-state-metric&size=small">' +
        '<b>' + score.value.name + '</b><p>' + 'You need +' + (parseInt(score.meta.high) - parseInt(point.value)) + ' ' + score.meta.base_metric.name +' points to get to ' + score.meta.next + '</p></p>'
      );
    } else {
      $('#pl_profile_badges tbody').append(
        '<tr>' +
          '<td>' + score.metric.name + '</td><td>' + score.value + '</td>' +
        '</tr>'
      );
    }
  }
}
