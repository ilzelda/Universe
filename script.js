var Nav={
	setColor:function(color1,color2){	
		let nav_lists=document.querySelector('ul').querySelectorAll('li');
		
		for(let i=0; i<nav_lists.length; i++)
			{
				if(i%2===0)
					nav_lists[i].style.backgroundColor=color1;
				else
					nav_lists[i].style.backgroundColor=color2;
			}
	}
}

var Bar={
	setColor:function(color){
		let bar=document.getElementsByClassName('bar');
		bar[0].style.backgroundColor=color;
	}
}

function changeThemecolor(self){
	if(self.value==='green'){
		Nav.setColor('#95DBE5FF','#078282FF');
		Bar.setColor('#339E66FF');
		self.value='pink';
	}
	else{
		Nav.setColor('#F7CED7FF','#F99FC9FF');
		Bar.setColor('#EF6079FF');
		self.value='green';
	}
	
}