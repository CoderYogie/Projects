CREATE OR REPLACE TRIGGER SYSTEM.TRG_UPD_QOH
/* Trigger to order new supply*/
  AFTER INSERT or UPDATE ON purchases
  FOR EACH ROW

Declare
    lv_qoh           products.qoh%TYPE;
    lv_qoh_threshold products.qoh_threshold%TYPE;
BEGIN

    SELECT prd.qoh, prd.qoh_threshold
      INTO lv_qoh, lv_qoh_threshold
      FROM products prd
     WHERE prd.pid = :new.pid;

  --Reducing the quantity on hand    
   UPDATE products prd
     SET prd.qoh = prd.qoh - :new.qty
   WHERE prd.pid = :new.pid returning prd.qoh INTO lv_qoh;
   
   --Checking is quantity on hand less than threshold if yes reset the value of qoh by threshold + 10
    IF lv_qoh_threshold > lv_qoh
    THEN
   
      Dbms_Output.put_line('The current qoh of the product is below the required threshold and new supply is required.');

      UPDATE products prd
         SET prd.qoh = prd.qoh + prd.qoh_threshold + 10
       WHERE prd.pid = :new.pid
      RETURNING prd.qoh INTO lv_qoh;

      Dbms_Output.put_line('Restocking Supply...');
      Dbms_Output.put_line('New value of the qoh :- ' || lv_qoh || '.');

    END IF;

    Exception
      When Others then
        dbms_output.put_line(SQLERRM);

END;
/

