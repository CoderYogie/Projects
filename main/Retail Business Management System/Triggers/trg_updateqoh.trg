CREATE OR REPLACE TRIGGER SYSTEM.TRG_UPDATEQOH
  AFTER UPDATE OF qoh ON products
  FOR EACH ROW
BEGIN
  INSERT INTO logs
  VALUES
    (LOG_SEQ.nextval,
     USER,
     'UPDATE',
     SYSDATE,
     'PRODUCTS',
     :new.pid);

EXCEPTION
  WHEN OTHERS THEN
    NULL;
END;
/

