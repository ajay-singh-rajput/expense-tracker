let cards = document.querySelectorAll('.card')
let categoryCheckBox = document.querySelectorAll('.selectCate')

let showCate = []
let tottalSpend = 0;

categoryCheckBox.forEach(function(check){
    check.addEventListener('click', function(){
        if(check.checked){
            if(!showCate.includes(check.value)){
                showCate.push(check.value)
            } 
        }else if(!check.checked){
            if(showCate.includes(check.value)){
            //  let ind = showCate.findIndex(check.value);
            //  showCate.splice(ind, 1);
             showCate.forEach((recate, rbIndex)=>{
                if (check.value === recate) {
                    showCate.splice(rbIndex, 1);
                }
            })
            }
        }
        tottalSpend = 0;
        if(showCate.length == 0){
            cards.forEach(function(card){
                card.style.display = 'flex'
                tottalSpend += +card.getAttribute('spend')
            })
        } else {
            cards.forEach(function(card){
                if(showCate.includes(card.getAttribute('cate'))){
                    card.style.display = 'flex'
                    tottalSpend += +card.getAttribute('spend')
                } else{
                    card.style.display = 'none'
                }
            })
        }
        document.querySelector('.greenShow').textContent = tottalSpend;
    })
})
