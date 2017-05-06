function getKeys(line){
  var m = line.match(/^((?:, |[^\s　])+)/)
  var s = m[1];

  if(!s.match(/, |\(|\)/)){
    return [s];
  }else if(!s.match(/\(|\)/)){
    return s.split(", ");
  }else{
    
    var res = [];
    var ls = s.split(", ");

    for(var i=0; i<ls.length; i++){
      var t = ls[i];  
      if(t.match(/\(/)){
        res.push(t.replace(/\([a-z]\)/,""));
        res.push(t.replace(/\(([a-z])\)/,"$1"));
      }else{
        res.push(t)
      }
    }

    return res;
  }
}

function createDict(s){
  var dict = {};
  var lines = s.split(/\r?\n/);
  var n = lines.length;
  var headlines = null;
  var prev = null;
  var line = null;
  var content = "";
  
  for(var i=0; i<n+1; i++){
    if(i < n){
      line = lines[i];
    }

    if(i == n || line.match(/^[^　]/)){
      if(prev != null){
        var headline = lines[prev];
        var keys = getKeys(headline);

        for(var j=0; j<keys.length; j++){
          dict[keys[j]] = content;
        }
      }

      if(i < n){
        prev = i;
        content = "";
      }
    }else{
      content += (line + "\n"); 
    }
  }

  return dict;
}

function startsWith(str, prefix){
  return str.lastIndexOf(prefix, 0) === 0;
}

function endsWith(str, suffix){
  return str.match(suffix+"$")==suffix;
}

function search(keyword,dict,opts){
  var keys = [];

  var roots_only = (typeof opts["roots_only"] !== "undefined");

  for (var k in dict){
    if (dict.hasOwnProperty(k)) {
      if(startsWith(k, keyword)){
        keys.push(k);
      }
    }
  }

  if(keys.length === 0){
    return "";
  }else{
    var lines = [];
    for(var i=0; i<keys.length; i++){
      var key = keys[i];
      var type = "";
      if(startsWith(key,"-")){
        if(roots_only){ continue; }
        type = '<span class="type suffix">接尾</span>';
      }else if(endsWith(key,"-")){
        if(roots_only){ continue; }
        type = '<span class="type prefix">接頭</span>';
      }else{
        type = '<span class="type root">語根</span>';
      }
      lines.push('<span class="key">' + key + '</span> ' + type);
      lines.push(dict[key]);
    }
    return lines.join("<br>");
  }
}

jQuery(function($){

  $.get("./gokan.txt", function(gokan){

    var old_input = "";

    var dict = createDict(gokan);

    function searchTrigger(){
        var text = $("#input").val();
        var opts = {};

        if(text == ""){
          return;
        }

        if(text == "*"){
          text = "";
        }

        if($("#roots_only").is(":checked")){
          opts["roots_only"] = true;
        }

        var res = search(text,dict,opts);
        $("#result").html(res.replace(/\n/g, "<br>"));
    }

    $("#input").keyup(function(e){
      e.preventDefault();
      var $this = $(this); 
      var v = $this.val();

      if(old_input != v){
        searchTrigger();
      }

      old_input = v;
    });

    $("#roots_only").change(function(e){
      e.preventDefault();
      searchTrigger();
    });

    $("#loading").hide();
    $("#contents").show();

  });

});
