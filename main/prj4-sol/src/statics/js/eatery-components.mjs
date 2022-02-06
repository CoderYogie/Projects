import { newElement, geoLoc } from './util.mjs';


/*
  A component which searches for eateries by location and cuisine.
  The location must be set to the browser's location (from geoLoc()).

  This component has two attributes:

    ws-url:  the base URL (protocol, host, port) where the web
             services are located.
    cuisine: the cuisine to be searched for.

  This component does not do anything when first connected to the DOM.
  It must respond to changes in its attribute values:

    ws-url: when this attribute changes, the component simply remembers
    its value.

    cuisine: when changed, the component should make a web-service call
    to search for eateries for that cuisine with location set to the 
    browser's location.  Then it should set it's content corresponding
    to the pseudo-HTML shown below (dynamic data is shown within ${...} and
    wsData is the data returned from the web-service call):

      <ul class="eatery-results">
	<!-- repeat for each eatery in wsData.eateries -->
	<li>
	  <span class="eatery-name">${eatery.name}</span>
	  <span>${eatery.dist} miles</span>
	  <a href=${links:self.href}>
	    <button>Select</button>
	  </a>
	</li>
      </ul>

    The handler for the Select button should be set up to set
    the eatery-url attribute for the eatery-details component.

    This should be followed by up-to two scrolling links:

      <div class="scroll">
	<!-- only when ${wsData.links:prev} -->
	<a rel="prev" href="${wsData.links:prev.href}">
	  <button>&lt;</button>
	</a>
	<!-- only when ${wsData.links:next} -->
	<a rel="next" href="${wsData.links:next.href}">
	  <button>&gt;</button>
	</a>
      </div>

    When the above scrolling links are clicked, the results should
    be scrolled back-and-forth.

*/
class EateryResults extends HTMLElement {


  static get observedAttributes() { return [ 'ws-url', 'cuisine', ]; }

  async attributeChangedCallback(name, oldValue, newValue) {
    //TODO
    const wsUrl = this.getAttribute('ws-url');

    const location = await geoLoc();

    if(name === 'cuisine' && newValue !== ''){
      //document.querySelector('eatery-details').innerHTML ='';
      const myUrlWithParams = new URL(`${wsUrl}/eateries/${location.lat},${location.lng}`);

      myUrlWithParams.searchParams.append("cuisine", newValue);

      const results = await getDataFromUrl(myUrlWithParams.href);

      this.renderCuisines(results,wsUrl);
   
      this.renderPagingAnchors(wsUrl,results);
    }

  }

   //TODO auxiliary methods
   
  renderCuisines(results,wsUrl){
    const list = [];
    for(const eatery of results.eateries){
      const elements = [];
      const span_name = newElement('span', { class : 'eatery-name'}, eatery.name);
      const span_dist = newElement('span', {}, parseFloat(eatery.dist).toFixed(2)+' miles');
      const btnSelect = newElement('button', {}, 'Select');
      
      const anchor = newElement('a', { class : 'select-eatery' , href : new URL(`${wsUrl}/eateries/${eatery.id}`)}, btnSelect);
      anchor.addEventListener('click',async ev => {
        ev.preventDefault();
        const eatery_details = document.querySelector('eatery-details');
        eatery_details.innerHTML = '';
        document.querySelector('eatery-details').
        setAttribute('eatery-url', ev.currentTarget.href)
      });
      const li = newElement('li', {}, span_name,span_dist,anchor);
      list.push(li);
    }
    this.innerHTML='';
    this.append(newElement('ul', { class: 'eatery-results' }, ...list));
  }

  async refreshCuisines(href,wsUrl){
    const results = await getDataFromUrl(href);
    
     this.renderCuisines(results,wsUrl);
     this.renderPagingAnchors(wsUrl,results);
  }

  renderPagingAnchors(wsUrl,results){
    const anchors = [];  
    const btnPrev = newElement('button', {}, '<');

   for(const link of results.links){
     if(link.rel === 'prev'){
      const anchorPrev = newElement('a', { rel : 'prev' , href : getHref(results.links,'prev')}, btnPrev);
    
    anchorPrev.addEventListener('click',async ev => {
      ev.preventDefault();
       await this.refreshCuisines(ev.currentTarget.href,wsUrl);
    });

    anchors.push(anchorPrev);
     }else if(link.rel === 'next'){
      const btnNext = newElement('button', {}, '>');

    const anchorNext = newElement('a', { rel : 'next' , href : getHref(results.links,'next')}, btnNext);
    
    anchorNext.addEventListener('click',async ev => {
      ev.preventDefault();
       await this.refreshCuisines(ev.currentTarget.href,wsUrl);
    });
    anchors.push(anchorNext);
  
     }
   }
    const scroll = newElement('div', { class: 'scroll' }, ...anchors);
    this.append(scroll);
  }
}

//register custom-element as eatery-results
customElements.define('eatery-results', EateryResults);


/*
  A component which shows the details of an eatery.  

  When created, it is set up with a buyFn *property* which should be
  called with an eatery-id and item-id to order a single unit of the
  item item-id belonging to eatery-id.

  The component has a single attribute: eatery-url which is the url
  for the web service which provides details for a particular eatery.

  This component does not do anything when first connected to the DOM.
  It must respond to changes in its eatery-url attribute.  It must
  call the web service corresponding to the eatery-url and set it's
  content corresponding to the pseudo-HTML shown below (dynamic data
  is shown within ${...} and wsData is the data returned from the
  web-service call):


      <h2 class="eatery-name">${wsData.name} Menu</h2>
      <ul class="eatery-categories">
	<!-- repeat for each category in wsData.menuCategories -->
	<button class="menu-category">${category}</button>
      </ul>
      <!-- will be populated with items for category when clicked above -->
      <div id="category-details"></div>

  The handler for the menu-category button should populate the
  category-details div for the button's category as follows:

      <h2>${category}</h2>
      <ul class="category-items">
	<!-- repeat for each item in wsData.flatMenu[wsData.menu[category]] -->
	<li>
	  <span class="item-name">${item.name}</span>
	  <span class="item-price">${item.price}</span>
	  <span class="item-details">${item.details}</span>
	  <button class="item-buy">Buy</button>
	</li>
      </ul>

  The handler for the Buy button should be set up to call
  buyFn(eatery.id, item.id).

*/
class EateryDetails extends HTMLElement {

  static get observedAttributes() { return [ 'eatery-url', ]; }
  
  async attributeChangedCallback(name, oldValue, newValue) {
    //TODO
    const url = this.getAttribute('eatery-url');
    const btns = [];
    const details = await getDataFromUrl(url);
    
    if(details.err === undefined){
      const name = `${details.name} Menu`;
      const h2 = newElement('h2', { class: 'eatery-name' }, name);
        this.append(h2);

      for (const [k, v] of Object.entries(details.menuCategories ?? [])) {
        const menuBtns = newElement('button', { class: 'menu-category' }, v);
        menuBtns.addEventListener('click', ev => {
          this.getCategoryDetails(v,details);
          ev.preventDefault();
        });
        btns.push(menuBtns);
        
      }

      const ul = newElement('ul', { class: 'eatery-categories' }, ...btns);
      this.append(ul);

      const cat_div = newElement('div', { id: 'category-details' }, );
      this.append(cat_div);
    }
  }

  //TODO auxiliary methods
 getCategoryDetails(cat,details){
  const list = [];
  const div = document.querySelector('#category-details');
  div.innerHTML = '';
  const h2 = newElement('h2', {}, cat);
  div.append(h2);

  for (const [k, v] of Object.entries(details.menu ?? [])) {
    if(k===cat){
      const items = Object.values(v);
      const map = new Map(Object.entries(details.flatMenu));
      for(const item of items){
        const obj = map.get(item);
        const elements = [];
        const span_name = newElement('span', { class : 'item-name'}, obj.name);
        const span_price = newElement('span', { class : 'item-price'}, `$ ${obj.price}`);
        const span_details = newElement('span', { class : 'item-details'}, obj.details);
        const btn = newElement('button', { class : 'item-buy'}, 'Buy');
        btn.addEventListener('click', ev => {
          this.buyFn(details.id,item);
          ev.preventDefault();
        });
        const li = newElement('li', {}, span_name,span_price,span_details,btn);
        list.push(li);
      }

      const ul = newElement('ul', { class : 'category-items'}, ...list);
      div.append(ul);
      div.scrollIntoView();
    }
  }
}


}

//register custom-element as eatery-details
customElements.define('eatery-details', EateryDetails);

/** Given a list of links and a rel value, return the href for the
 *  link in links having the specified value.
 */
function getHref(links, rel) {
  return links.find(link => link.rel === rel)?.href;
}

//TODO auxiliary functions
async function getDataFromUrl(url) {
  try {
    const response = await fetch(url, {
method: 'GET',
headers: { 'Content-Type': 'application/json' },
    });
    return await responseResult(response);
  }
  catch (err) {
    return {err};
  }
}


async function responseResult(response) {
const ret = await response.json();
if (response.ok) {
  return ret;
}
else {
  return response.statusText;
}
}

