CREATE OR REPLACE TRIGGER SYSTEM.TRG_UPD_CUSTOMER
/* Trigger to update visit_made and last visit date*/
  AFTER INSERT or UPDATE ON purchases
  FOR EACH ROW
BEGIN
  
  UPDATE customers cust
     SET cust.visits_made = cust.visits_made + 1,
         cust.last_visit_date = trunc(sysdate)
   WHERE cust.cid = :new.cid;
   
   Exception 
     when others then 
       Dbms_Output.put_line(SQLERRM);

END;
/

