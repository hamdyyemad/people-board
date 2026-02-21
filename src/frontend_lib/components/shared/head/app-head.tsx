const themeScript = `
  (function(){
    var k='theme-storage';
    var v=localStorage.getItem(k);
    var t='light';
    if(v){
      try{
        var p=JSON.parse(v);
        if(p&&p.state&&p.state.theme) t=p.state.theme;
      }catch(e){}
    }
    document.documentElement.classList.add(t);
  })();
`;

export function Head() {
  return (
    <head>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    </head>
  );
}