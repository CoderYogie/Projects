CREATE OR REPLACE PACKAGE PKG_RBMS IS

  FUNCTION no_of_customer(p_pid IN Products.pid%TYPE) RETURN VARCHAR2;

  PROCEDURE P_SHOW_DATA(P_TABLE_NAME VARCHAR2,
                        P_TAB_COL    OUT NUMBER,
                        P_OUT_MSG    OUT SYS_REFCURSOR);

  PROCEDURE purchase_made(customer_id IN customers.cid%TYPE,
                          p_out_msg   OUT VARCHAR2,
                          p_out       OUT SYS_REFCURSOR);

  PROCEDURE add_customer(c_id         IN customers.cid%TYPE,
                         c_name       IN customers.name%TYPE,
                         c_telephone# IN customers.telephone#%TYPE,
                         p_out_msg    OUT VARCHAR2);

  PROCEDURE add_purchase(e_id           employees.eid%TYPE,
                         p_id           products.pid%TYPE,
                         c_id           customers.cid%TYPE,
                         pur_qty        purchases.qty%TYPE,
                         pur_unit_price purchases.unit_price%TYPE,
                         p_out_msg      OUT VARCHAR2);

END PKG_RBMS;
/
CREATE OR REPLACE PACKAGE BODY PKG_RBMS IS

  FUNCTION NO_OF_CUSTOMER(p_pid IN Products.pid%TYPE) RETURN VARCHAR2 IS
    
    /*  Variable Declaration... */
    
    no_of_customers VARCHAR2(50);
    lv_pid_exists   NUMBER;
    lv_pid_exec EXCEPTION;  
  
  BEGIN
  
    SELECT COUNT(*)
      INTO lv_pid_exists
      FROM products
     WHERE pid = lower(p_pid);
  
    IF lv_pid_exists > 0
    THEN
    
      SELECT COUNT(c.cid)
        INTO no_of_customers
        FROM Customers c, Purchases pur
       WHERE pur.cid = c.cid
         AND pur.pid = lower(p_pid);
    
    ELSE
      RAISE lv_pid_exec;
    END IF;
  
    RETURN(no_of_customers);
  
  EXCEPTION
    WHEN lv_pid_exec THEN
      RETURN('No such product found.');
    
  END;

  PROCEDURE P_SHOW_DATA(P_TABLE_NAME VARCHAR2,
                        P_TAB_COL    OUT NUMBER,
                        P_OUT_MSG    OUT SYS_REFCURSOR) IS
  
    lv_exec EXCEPTION;
  BEGIN
    SELECT COUNT(1)
      INTO P_TAB_COL
      FROM user_tab_columns s
     WHERE s.TABLE_NAME = UPPER(P_TABLE_NAME);
  
    BEGIN
      OPEN P_OUT_MSG FOR 'Select * from ' || P_TABLE_NAME;
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        RAISE lv_exec;
    END;
  
  EXCEPTION
    WHEN lv_exec THEN
      Dbms_Output.put_line(SQLERRM);
    WHEN OTHERS THEN
      Dbms_Output.put_line('No such Table');
    
  END P_SHOW_DATA;

  PROCEDURE PURCHASE_MADE(customer_id IN customers.cid%TYPE,
                          p_out_msg   OUT VARCHAR2,
                          p_out       OUT SYS_REFCURSOR) IS
  
    lv_count NUMBER;
  
  BEGIN
  
    SELECT COUNT(1)
      INTO lv_count
      FROM customers cust, Purchases pur
     WHERE cust.cid = pur.cid
       AND cust.cid = customer_id;
  
    OPEN p_out FOR
      SELECT cust.name,
             pur.pid,
             pur.pur_date,
             pur.qty,
             pur.unit_price,
             pur.total
        FROM customers cust, Purchases pur
       WHERE cust.cid = pur.cid
         AND cust.cid = customer_id;
  
    IF lv_count > 0
    THEN
      p_out_msg := 'Success';
    ELSE
      p_out_msg := 'No purchase found of the customer';
    END IF;
  
  EXCEPTION
    WHEN OTHERS THEN
      dbms_output.put_line(SQLERRM);
  END;

  PROCEDURE ADD_CUSTOMER(c_id         IN customers.cid%TYPE,
                         c_name       IN customers.name%TYPE,
                         c_telephone# IN customers.telephone#%TYPE,
                         p_out_msg    OUT VARCHAR2) IS
  
    lv_cust_cnt NUMBER;
    lv_cust_exec EXCEPTION;
    lv_cid_exec  EXCEPTION;
    lv_tele_exec EXCEPTION;
  
  BEGIN
  
    SELECT COUNT(1)
      INTO lv_cust_cnt
      FROM customers cust
     WHERE cust.cid = c_id;
  
    IF lv_cust_cnt = 1
    THEN
      RAISE lv_cust_exec;
    END IF;
  
    IF substr(c_id, 1, 1) <> 'c'
    THEN
      RAISE lv_cid_exec;
    END IF;
    IF length(c_id) <> 4
    THEN
      RAISE lv_cid_exec;
    END IF;
    IF length(c_telephone#) <> 10
    THEN
      RAISE lv_tele_exec;
    END IF;
  
    INSERT INTO customers
      (CID,
       NAME,
       TELEPHONE#,
       VISITS_MADE,
       LAST_VISIT_DATE)
    VALUES
      (lower(c_id),
       c_name,
       c_telephone#,
       1,
       SYSDATE);
  
    p_out_msg := 'Success';
  
    COMMIT;
  
  EXCEPTION
    WHEN lv_cust_exec THEN
      p_out_msg := 'Customer id already exists';
    WHEN lv_cid_exec THEN
      p_out_msg := 'CID length should be 4 digit and it must be start with c ';
    WHEN lv_tele_exec THEN
      p_out_msg := 'Invalid telephone number';
    WHEN OTHERS THEN
      ROLLBACK;
      p_out_msg := SQLERRM;
      dbms_output.put_line(SQLERRM);
  END;

  PROCEDURE ADD_PURCHASE(e_id           employees.eid%TYPE,
                         p_id           products.pid%TYPE,
                         c_id           customers.cid%TYPE,
                         pur_qty        purchases.qty%TYPE,
                         pur_unit_price purchases.unit_price%TYPE,
                         p_out_msg      OUT VARCHAR2) IS
  
    lv_purid         purchases.pur#%TYPE;
    lv_regular_price products.regular_price%TYPE;
    lv_eid_exec EXCEPTION;
    lv_cid_exec EXCEPTION;
    lv_pid_exec EXCEPTION;
    lv_eid employees.eid%TYPE;
    lv_pid products.pid%TYPE;
    lv_cid customers.cid%TYPE;
    lv_qoh_exec    EXCEPTION;
    lv_discnt_exec EXCEPTION;
    lv_unit_value products.regular_price%TYPE;
    lv_qoh        NUMBER;
    lv_dup_purchase EXCEPTION;
  
  BEGIN
  
    SELECT COUNT(1) INTO lv_eid FROM employees e WHERE e.eid = e_id;
  
    SELECT COUNT(1) INTO lv_cid FROM customers c WHERE c.cid = c_id;
  
    SELECT COUNT(1) INTO lv_pid FROM products p WHERE p.pid = p_id;
  
    SELECT prd.regular_price * (1 - prd.discnt_rate)
      INTO lv_unit_value
      FROM products prd
     WHERE prd.pid = p_id;
  
    IF lv_unit_value <> pur_unit_price
    THEN
      RAISE lv_discnt_exec;
    END IF;
  
    IF lv_eid = 0
    THEN
      RAISE lv_eid_exec;
    END IF;
  
    IF lv_cid = 0
    THEN
      RAISE lv_cid_exec;
    END IF;
  
    IF lv_pid = 0
    THEN
      RAISE lv_pid_exec;
    END IF;
  
    SELECT nvl(prd.regular_price, 0)
      INTO lv_regular_price
      FROM products prd
     WHERE prd.pid = p_id;
  
    BEGIN
    
      INSERT INTO purchases
        (PUR#,
         EID,
         PID,
         CID,
         PUR_DATE,
         QTY,
         UNIT_PRICE,
         TOTAL,
         SAVING)
      VALUES
        (PURCHASE_SEQ.NEXTVAL,
         e_id,
         p_id,
         c_id,
         trunc(SYSDATE),
         pur_qty,
         pur_unit_price,
         round(pur_qty * pur_unit_price, 2),
         pur_qty * (lv_regular_price - pur_unit_price))
      RETURNING PUR# INTO lv_purid;
    
    EXCEPTION
      WHEN DUP_VAL_ON_INDEX THEN
        RAISE lv_dup_purchase;
    END;
  
    SELECT prd.qoh INTO lv_qoh FROM products prd WHERE prd.pid = p_id;
    /*
    UPDATE purchases pur
       SET pur.total  = round(pur_qty * pur_unit_price, 2),
           pur.saving = pur_qty * (lv_regular_price - pur_unit_price)
     WHERE pur.pur# = lv_purid;*/
  
    p_out_msg := 'Success';
    --   COMMIT;
  
  EXCEPTION
    WHEN lv_eid_exec THEN
      p_out_msg := 'Employee does not exists';
    WHEN lv_cid_exec THEN
      p_out_msg := 'Customer does not exists';
    WHEN lv_pid_exec THEN
      p_out_msg := 'Products does not exists';
    WHEN lv_discnt_exec THEN
      P_out_msg := 'Unit price for pid ' || p_id || ' is ' || lv_unit_value;
    WHEN lv_dup_purchase THEN
      p_out_msg := 'Customer purchases limit exceeded more than one.';
    WHEN OTHERS THEN
      ROLLBACK;
      p_out_msg := SQLERRM;
    
  END add_purchase;

END PKG_RBMS;
/
