import React from 'react';

import { sendBuyEvent, } from './util.mjs';

import OrdersWs from './orders-ws.mjs';

/** Top level <Order/> component: renders either <OrderSummary/> or
 *  <OrderDetail/> depending on props.expand.  Will maintain order
 *  within component state as well as sessionStorage.  Set up a new
 *  listener for the 'buy' custom event each time the orderId changes,
 *  calling the doBuy() function.
 */
export default function Order(props) {
  const { wsUrl, expand, expandFn } = props;

  //create instance of OrdersWs() which remains around for lifetime of component
  //ordersWsRef.current will contain OrdersWs instance
  const ordersWsRef = React.useRef(new OrdersWs(wsUrl));

  //a method to read eatery-order stored in localStorage.order.
  const localOrderRead = () => {
    const orderJson = localStorage.getItem('order');
    return orderJson ? JSON.parse(orderJson) : null;
  };

  //maintain order within components state, initialize from localStorage
  const [order, setOrder] = React.useState(localOrderRead);

  //TODO 3: effect to set up an event listener for the
  //buy custom event whenever the orderId changes.
  React.useEffect(() => {
    const buyEventHandler = async ev => {
      const {eateryId, itemId, nChanges } = ev.detail;
      setOrder(await doBuy(ordersWsRef.current, order, eateryId, itemId, nChanges));
     
    };
    document.addEventListener('buy', buyEventHandler);

    //cleanup listener on unmount
    return () => document.removeEventListener('buy', buyEventHandler);
  },[order]);  //[] dependency array means effect run only on mount

  return (expand) //delegate to separate components depending on expand
    ? <OrderDetail order={order} expandFn={expandFn} />
    : <OrderSummary order={order} expandFn={expandFn} />;
}

/** Use orders web service ordersWs to create nChanges changes in quantity
 *  for itemId in order for eatery eateryId.
 *  If order is null or eateryId does not match order.eateryId, make the
 *  changes in a new order for eateryId.
 *  Save updated eatery-order in localStorage and return it.
 */
async function doBuy(ordersWs, order, eateryId, itemId, nChanges) {
  //TODO 2:
  let neworder;
  if(order === null){
    neworder =await ordersWs.newOrder(eateryId);
    neworder =await  ordersWs.changeOrder(neworder.id, itemId, nChanges);
    localStorage.setItem('order', JSON.stringify(neworder));
  }else if(order.eateryId !== eateryId){
    localStorage.removeItem('order');
    neworder =await ordersWs.newOrder(eateryId);
    neworder =await  ordersWs.changeOrder(neworder.id, itemId, nChanges);
    localStorage.setItem('order', JSON.stringify(neworder));
  }else{
    neworder =await  ordersWs.getOrder(order.id);
    neworder =await  ordersWs.changeOrder(neworder.id, itemId, nChanges);
    localStorage.setItem('order', JSON.stringify(neworder));
  }
  return neworder;
}

/** Render summary of order.  Specifically return element of form:
 *
 *  <a onClick={onClick} href="#" className="order summary header">
 *    <span className="eatery-name">{eateryName}</span><br/>
 *     <span className="order-total">$ {total}</span>
 *  </a>
 *
 * where eateryName and total are pulled out of props.order and
 * onClick() will call props.expandFn(true) as well as turn
 * off default handling of the click.
 */
function OrderSummary(props) {
  const { order, expandFn } = props;
  //TODO 1:
  let eateryName,total;
  if(props.order===null){
    eateryName='';
    total=0;
  }else{
    eateryName = order.name;
    total = parseFloat(order.total).toFixed(2);
  }
 
   const  elements = [
      <a key= "anchor" onClick={(e) => {toggleFn(e, expandFn,true);}} href="#" className="order summary header">
        <span className="eatery-name">{eateryName}</span><br />
        <span className="order-total">$ {total}</span>
      </a>,
    ];
  return elements;
}


/** Show details of props.order, returns elements of the form:
 *  If order is null or does not contain any order-items, then
 *  simply render
 *
 *  <div key="order" className="order-empty">Your order is empty.</div>
 *
 *  followed by the "Continue Shopping" button (see below).
 *
 *  Otherwise render as follows:
 *  [
 *    <h2 key="order-eatery" className="order-eatery">{eateryName}</h2>,
 *    <div key="order-items" className="order-grid">{renderedItems}</div>,
 *     <div key="order-total" className="order-total order-grid">
 *       <span className="heading">Total</span><span>$ {orderTotal}</span>
 *    </div>,
 *    <button key="order-shop" className="order-shop" onClick={shopFn}>
 *       Continue Shopping
 *     </button>,
 *  ]
 *
 * (Note the use of key props since we have multiple consecutive elements).
 *
 * eateryName and orderTotal are extracted from props.order
 * (the latter is formatted to 2 decimal places).
 * shopFn() should be set up to call props.expandFn(false).
 *
 * The renderedItems is a list containing a rendering of the order items.
 * Each item should be rendered as follows:
 *
 * <div className="heading">{item.name}</div>
 *   <div>{item.details}</div>
 *   <div>
 *     {item.quantity} @ ${price} ea.
 *     <button className="item-change" onClick={incFn}>+</button>
 *     <button className="item-change" onClick={decFn}>-</button>
 *   </div>
 * </div>,
 * <div key="total">$ {itemTotal}</div>
 *
 * where price and itemTotal are derived from the item and formatted
 * to 2 decimal places and incFn()/decFn() will change the
 * number of items in the order by +1/-1 using a custom 'buy'
 * using util.sendBuyEvent().
 */
function OrderDetail(props) {
  const { order, expandFn } = props;
  let elements; 
  //TODO 4:
  if(order===null){
     elements = [
      <div key="order" className="order-empty">Your order is empty.</div>,
      <button key="order-shop" className="order-shop" onClick={(e) => {toggleFn(e, expandFn,false);}}>
        Continue Shopping
      </button>
    ];
  }else{
    const renderedItems = [];
    for(const item of order.items){
      renderedItems.push(getOrderItems(item,order.eateryId));
    }
    elements = [
      <h2 key="order-eatery" className="order-eatery">{order.name}</h2>,
      <div key="order-items"  className="order-grid">{renderedItems}</div>,
       <div key="order-total" className="order-total order-grid">
         <span className="heading">Total</span><span>$ {parseFloat(order.total).toFixed(2)}</span>
      </div>,
      <button key="order-shop" className="order-shop" onClick={(e) => {toggleFn(e, expandFn,false);}}>
         Continue Shopping
       </button>,
    ]
  }
  return elements;
}

function getOrderItems(item,eateryId){
 return  [
  <div>
  <div key="order-items-heading" className="heading">{item.name}</div>
     <div>{item.details}</div>
     <div>
       {item.quantity} @ ${item.price} ea.
       <button key="order-items-change-add" className="item-change" onClick={(e) => {incDescFn(e, item,eateryId,1);}}>+</button>
       <button key="order-items-change-sub" className="item-change" onClick={(e) => {incDescFn(e, item,eateryId,-1);}}>-</button>
     </div></div>,
   <div key="total">$ {parseFloat(item.quantityPrice).toFixed(2)}</div> ]

}

//Increment Decrement Button Function
function incDescFn(e,item,eateryId,val) {
  e.preventDefault();
  sendBuyEvent(eateryId,item.id,val);
}

//Toggle summary and main view
function toggleFn(e,expandFn,val) {
  e.preventDefault();
  expandFn(val);
}