document.getElementById('branch').addEventListener('change',function(){
    if(document.location.pathname.slice(-1) == '/')
        document.location.href = document.location.pathname + '?branch=' +  document.getElementById('branch').selectedOptions[0].text;
      else document.location.href = document.location.pathname + '/?branch=' +  document.getElementById('branch').selectedOptions[0].text;
});

