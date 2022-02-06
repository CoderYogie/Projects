CREATE OR REPLACE TRIGGER SYSTEM.TRG_CHECK_QOH
  BEFORE INSERT ON PURCHASES
  FOR EACH ROW
DECLARE
  lv_qoh products.qoh%TYPE;
  lv_exec EXCEPTION;
BEGIN

  SELECT prd.qoh INTO lv_qoh FROM products prd WHERE prd.pid = :new.pid;
  IF :NEW.QTY >= lv_qoh
  THEN
    RAISE lv_exec;
  END IF;
EXCEPTION
  WHEN lv_exec then
    dbms_output.put_line('Insufficient quantity in stock.');
    raise_application_error('-20101','Insufficient quantity in stock.');
  WHEN OTHERS THEN
    dbms_output.put_line(SQLERRM);

END;
/

