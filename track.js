// Usage tracking for the admin page. Sends small events to the "events" table:
// course opened, tab switched, section marked "Got it", one ping per active minute.
// It never sends what people type, and it fails silently.
(function(){
 function device(){var w=Math.min(screen.width||innerWidth,innerWidth);return w<700?'mobile':w<1100?'tablet':'desktop'}
 window.HEC_TRACK=function(sb,lang){
  if(!sb)return function(){};
  var dev=device(),q=[],busy=false;
  function flush(){
   if(busy||!q.length)return;busy=true;
   var batch=q.splice(0,20);
   sb.from('events').insert(batch).then(function(r){busy=false;if(r.error)console.warn('track:',r.error.message);if(q.length)flush()},function(){busy=false});
  }
  return function(type,f){
   f=f||{};
   var row={type:type,device:dev,lang:(f.lang||lang||'en').slice(0,2),course:null,detail:null,topic:null,label:null};
   ['course','detail','topic','label'].forEach(function(k){if(f[k])row[k]=String(f[k]).replace(/\s+/g,' ').trim().slice(0,k==='detail'?60:140)||null});
   q.push(row);setTimeout(flush,0);
  };
 };
})();
