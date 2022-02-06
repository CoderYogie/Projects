// usage:  1. compile: javac -cp /usr/lib/oracle/18.3/client64/lib/ojdbc8.jar jdbcdemo2.java
//         2. execute: java -cp /usr/lib/oracle/18.3/client64/lib/ojdbc8.jar jdbcdemo2.java

//Illustrate call stored procedure
import java.sql.Array;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.InputMismatchException;
import java.util.Scanner;

import oracle.jdbc.pool.OracleDataSource;

public class jdbcdemo2 {
	
	public static final String ANSI_RED = "\u001B[31m";
	public static final String ANSI_RESET = "\u001B[0m";
	public static final String ANSI_GREEN = "\u001B[32m";
	public static final String ANSI_BLUE = "\u001B[34m";

	public static void main(String args[]) throws ParseException, SQLException {
		try {
			System.out.println(ANSI_GREEN + "Welcome to Retail Management System"+ ANSI_RESET);
			mainLoop();

		} catch (NumberFormatException ex) // If exception, try again.
		{
			System.out.println(ANSI_RED +  "Invalid input! You have to enter a number" + ANSI_RESET);
			mainLoop();
		} catch (Exception e) {
			System.out.println(ANSI_RED +  "\n*** other Exception caught ***\n" + e.getMessage()  + ANSI_RESET);
		}

	}

	public static boolean mainLoop() throws ParseException, SQLException {

		try {
			System.out.println(ANSI_GREEN + "Please choose from options below :" + ANSI_RESET);
			System.out.println("1. VIEW\n2.SHOW PURCHASE BY CID\n3.GET TOTAL NUMBER OF CUSTOMERS BY PID\n4.ADD CUSTOMER\n5.ADD PURCHASE");
			Scanner input = new Scanner(System.in);
			int selection = input.nextInt();
			
			if(selection > 5) {
				throw new Exception("Please choose from options 1-5 .");
			}
			
			while (selection < 6) {
				int val = 0;
				switch (selection) {
				case 1:
					System.out.println("Choose tables to view mentioned below :");
					System.out.println("1.CUSTOMERS\n2.EMPLOYEES\n3.PURCHASES\n4.PRODUCTS\n5.LOGS");
					val = input.nextInt(); // object of scanner class
					viewTables(val);
					System.out.println("\n");
					break;

				case 2:
					System.out.println("Please enter Cid of Customer :");
					String cid = input.next(); // object of scanner class
					viewPurByCid(cid);

					System.out.println("\n");
					break;

				case 3:
					System.out.println("Please enter PID of Product :");
					String pid = input.next(); // object of scanner class
					getNoCustomers(pid);
					System.out.println("\n");
					break;

				case 4:
					System.out.println("Please enter CID of Customer :");
					 cid = input.next(); // object of scanner class

					System.out.println("Please enter Name of Customer :");
					 String name = input.next(); // object of scanner class
					 
					System.out.println("Please enter telephone of Customer :");
					 String telephone = input.next(); // object of scanner class
					
					addCustomer(cid,name,telephone);
					System.out.println("\n");
					break;
					
				case 5:
					System.out.println("Please enter EID of Purchase :");
					 String eid = input.next(); // object of scanner class

					System.out.println("Please enter PID of Product :");
					 pid = input.next(); // object of scanner class
					
					System.out.println("Please enter CID of Customer :");
					 cid = input.next(); // object of scanner class
					 
					System.out.println("Please enter purchase quantity of Product :");
					 String pur_qty = input.next(); // object of scanner class
					 
					 
					System.out.println("Please enter purchase unit price of Product :");
					 String unit_pr = input.next(); // object of scanner class
					
					addPurchase(eid,pid,cid,pur_qty,unit_pr);
					System.out.println("\n");
					break;	


				}
				System.out.println("1. VIEW\n2.SHOW PURCHASE BY CID\n3.GET TOTAL NUMBER OF CUSTOMERS BY PID\n4.ADD CUSTOMER\n5.ADD PURCHASE");
				selection = input.nextInt();
				
				if(selection > 5) {
					throw new Exception("Please choose from options 1-5 .");
				}
			}
		} catch (InputMismatchException ex) {

			//System.out.println("Invalid input! You have to enter a number");
			
			System.out.println(ANSI_RED + "Invalid input! You have to enter a number" + ANSI_RESET);

			mainLoop();
		}catch (Exception e) {

			//System.out.println("Invalid input! You have to enter a number");
			
			System.out.println(ANSI_RED + "Invalid input!"+ e.getMessage() + ANSI_RESET);

			mainLoop();
		}

		return true;
	}

	public static Connection getConnection() throws SQLException {
		Connection conn = null;
		try {
			OracleDataSource ds = new oracle.jdbc.pool.OracleDataSource();
			ds.setURL("jdbc:oracle:thin:@localhost:1521:XE");
			conn = ds.getConnection("system", "system");
			//ds.setURL("jdbc:oracle:thin:@castor.cc.binghamton.edu:1521:ACAD111");
			 //conn = ds.getConnection("yingale1", "root123");
		
		} catch (SQLException ex) {
			System.out.println(ANSI_RED + ex.getMessage()+ ANSI_RESET);
		}
		return conn;
	}

	public static boolean getNoCustomers(String pid) throws ParseException, SQLException {

		try {
			Connection conn = getConnection();

			// Query
			Statement stmt = conn.createStatement();

			// Save result
			ResultSet rset;
			String name = "";
			rset = stmt.executeQuery("SELECT PKG_RBMS.NO_OF_CUSTOMER('" + pid + "') FROM dual");

			// Print
			while (rset.next()) {
				if (rset.getString(1).startsWith("No")) {
					System.out.print(ANSI_RED + rset.getString(1) + ANSI_RESET);
				} else {
					stmt =  conn.createStatement();
					ResultSet rs = stmt.executeQuery("SELECT name from products where pid = '" + pid + "'");
					
					while(rs.next()) {
						name = rs.getString(1);
					}
					System.out.print(ANSI_GREEN + "Total number customers who purchased PID "+ pid +"("+ name +") are " + rset.getString(1) + "  " + ANSI_RESET);
				}

			}
			rset.close();
			conn.close();
		} catch (SQLException ex) {
			System.out.println(ANSI_RED +"Exception in View Purchase By CID : " + ex.getMessage()+ ANSI_RESET);
			return false;
		} catch (Exception e) {
			System.out.println(ANSI_RED +"Exception in View Purchase By CID : " + e.getMessage()+ ANSI_RESET);
			return false;
		}
		return true;
	}
	
	public static boolean addCustomer(String cid, String name, String telephone) throws ParseException, SQLException {
		try {
			Connection conn = getConnection();

			CallableStatement cs = conn.prepareCall("CALL PKG_RBMS.add_customer(?,?,?,?)");

			// set the in parameter (the first parameter)
			cs.setObject(1, cid);

			// set the in parameter (the second parameter)
			cs.setObject(2, name);
			

			// set the in parameter (the third parameter)
			cs.setObject(3, telephone);

			// register the out parameter (the second parameter)
			cs.registerOutParameter(4, Types.VARCHAR);

			cs.executeUpdate();
			// get the out parameter result.

			String result = cs.getString(4);

			if(result.equalsIgnoreCase("Success")) {
				System.out.println(ANSI_GREEN +"Customer added successfully with cid " + cid+ ANSI_RESET);
			}else {
				System.out.println(ANSI_RED + result+ ANSI_RESET);
			}
			cs.close();
			conn.close();
		} catch (SQLException ex) {
			System.out.println(ANSI_RED +"Exception in View Tables : " + ex.getMessage()+ ANSI_RESET);
			return false;
		} catch (Exception e) {
			System.out.println(ANSI_RED +"Exception in View Tables : " + e.getMessage()+ ANSI_RESET);
			return false;
		}
		return true;
	}
	
	public static void addPurchase(String eid, String pid, String cid, String pur_qty, String unit_pr) throws ParseException, SQLException {
		try {
			Connection conn = getConnection();
			String result = null;
			
			Statement s = conn.createStatement();
			s.executeUpdate("begin dbms_output.enable(); end;");
			
			CallableStatement cs = conn.prepareCall("CALL PKG_RBMS.add_purchase(?,?,?,?,?,?)");
			
			// set the in parameter (the first parameter)
			cs.setObject(1, eid);

			// set the in parameter (the second parameter)
			cs.setObject(2, pid);
			
			// set the in parameter (the third parameter)
			cs.setObject(3, cid);
			
			// set the in parameter (the third parameter)
			cs.setObject(4, pur_qty);

			// set the in parameter (the third parameter)
			cs.setObject(5, unit_pr);

			// register the out parameter (the second parameter)
			cs.registerOutParameter(6, Types.VARCHAR);

			cs.executeUpdate();
			// get the out parameter result.
			
	        try (CallableStatement call = conn.prepareCall(
	            "declare "
	          + "  num integer := 1000;"
	          + "begin "
	          + "  dbms_output.get_lines(?, num);"
	          + "end;"
	        )) {
	            call.registerOutParameter(1, Types.ARRAY,
	                "DBMSOUTPUT_LINESARRAY");
	            call.execute();
	 
	            Array buf = null;
	            try {
	            	buf = call.getArray(1);
					
	                for(Object a : (Object[]) buf.getArray()) {
	                	if(a!=null) {
	                		System.out.println(ANSI_GREEN +a+ANSI_RESET);
	                	}
	                }
	            }
	            
	            finally {
	                if (buf != null)
	                	buf.free();
	                s.executeUpdate("begin dbms_output.disable(); end;");
	            }
	        }

			result = cs.getString(6);
			
			if(result !=null && result.equalsIgnoreCase("Success")) {
				System.out.println(ANSI_GREEN +"Purchase added successfully. "+ ANSI_RESET);
			}
	
			//Closing callable statements and connection
			cs.close();
			s.close();
			conn.close();

		} catch (SQLException ex) {
			System.out.println(ANSI_RED +"Exception in add purchase : " + ex.getMessage()+ ANSI_RESET);
		} catch (Exception e) {
			System.out.println(ANSI_RED +"Exception in add purchase : " + e.getMessage()+ ANSI_RESET);
		}
	}


	//View Purchase by passing CID to the function viewPurByCid();
	public static boolean viewPurByCid(String cid) throws ParseException, SQLException {

		ResultSet rs = null;
		try {
			//Get Oracle Connection
			Connection conn = getConnection();
			
			//Prepare Call Statement
			CallableStatement cs = conn.prepareCall("CALL PKG_RBMS.purchase_made(?,?,?)");

			// set the in parameter (the first parameter)
			cs.setString(1, cid);

			// register the out parameter (the second parameter)
			cs.registerOutParameter(3, oracle.jdbc.OracleTypes.CURSOR);

			// register the out parameter (the second parameter)
			cs.registerOutParameter(2, Types.VARCHAR);

			// execute the stored procedure
			cs.executeUpdate();

			// get the out parameter result.
			String result = cs.getString(2);

			if (!result.equalsIgnoreCase("Success")) {
				System.out.println(ANSI_RED +result + " with cid : " + cid +ANSI_RESET);
			} else {
				rs = (java.sql.ResultSet) cs.getObject(3);
				ResultSetMetaData rsmd = rs.getMetaData();
				String temp = "| %-15s ";
				String leftAlignFormat = "";
				String line = "+-----------------";
				String lineformat = "";
				
				for(int i = 0;i < rsmd.getColumnCount();i++) {
					leftAlignFormat += temp;
					lineformat += line;
				}
				
				leftAlignFormat += "|%n";

				System.out.format(lineformat+"+%n");
				System.out.format(leftAlignFormat, rsmd.getColumnName(1),rsmd.getColumnName(2),rsmd.getColumnName(3),rsmd.getColumnName(4),rsmd.getColumnName(5),rsmd.getColumnName(6));
				System.out.format(lineformat+"+%n");

				
				while (rs.next()) {
					SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
					java.util.Date parsedDate = sdf1.parse(rs.getString("PUR_DATE"));
					SimpleDateFormat print = new SimpleDateFormat("dd-MM-YYYY");
				    System.out.format(leftAlignFormat, rs.getString("NAME"), rs.getString("PID"), print.format(parsedDate) ,rs.getString("QTY") ,rs.getString("UNIT_PRICE") ,rs.getString("TOTAL"));
				}
				System.out.format(lineformat+"+%n");

				rs.close();
			}
			cs.close();
			conn.close();
		} catch (SQLException ex) {
			System.out.println(ANSI_RED +"Exception in View Purchase By CID : " + ex.getMessage()+ ANSI_RESET);
			return false;
		} catch (Exception e) {
			System.out.println(ANSI_RED +"Exception in View Purchase By CID : " + e.getMessage()+ ANSI_RESET);
			return false;
		}
		return true;
	}
	
	//View all tables in Retail Business Management System
	public static boolean viewTables(int val) throws ParseException, SQLException {

		ResultSet rs = null;
		String tablename = null;
		try {
			Connection conn = getConnection();

			if (val == 1) {
				tablename = "customers";
			} else if (val == 2) {
				tablename = "employees";
			} else if (val == 3) {
				tablename = "purchases";
			} else if (val == 4) {
				tablename = "products";
			} else if (val == 5) {
				tablename = "logs";
			}

			CallableStatement cs = conn.prepareCall("CALL PKG_RBMS.P_SHOW_DATA(?,?,?)");

			// set the in parameter (the first parameter)
			cs.setString(1, tablename);

			// register the out parameter (the second parameter)
			cs.registerOutParameter(3, oracle.jdbc.OracleTypes.CURSOR);

			// register the out parameter (the second parameter)
			cs.registerOutParameter(2, Types.INTEGER);

			// execute the stored procedure
			cs.executeUpdate();

			// get the out parameter result.
			int count = cs.getInt(2);

			//get Cursor result in result set
			rs = (java.sql.ResultSet) cs.getObject(3);
			
			//get column names of the table from result set
			ResultSetMetaData rsmd = rs.getMetaData();
			
			//Variables for Table format view
			String temp = "| %-15s ";
			String leftAlignFormat = "";
			String line = "+-----------------";
			String lineformat = "";
			
			// Arrays for Column names and result set.
			Object[] arr = new Object[count];
			Object[] arr2 = new Object[count];
			
			//create table format as per the total number of columns in the result.
			for(int i = 0;i < count;i++) {
				leftAlignFormat += temp;
				lineformat += line;
				arr[i]=rsmd.getColumnName(i+1);
			}
			
			//End of the Format
			leftAlignFormat += "|%n";

			System.out.println(ANSI_GREEN + "Tablename : "+(tablename).toUpperCase() + ANSI_RESET);
			
			//Print table headers
			System.out.format(lineformat+"+%n");
			System.out.format(leftAlignFormat,arr);
			System.out.format(lineformat+"+%n");

			while (rs.next()) {
				
				
				for(int i = 0;i < count;i++) {
					
					//convert date to dd-MM-YYYY format
					if(arr[i].toString().endsWith("DATE")) {
						  SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
						  java.util.Date parsedDate = sdf1.parse(rs.getString(arr[i].toString()));
						  SimpleDateFormat print = new SimpleDateFormat("dd-MM-YYYY");
						  arr2[i]= print.format(parsedDate);  //add to the result array
						
					// convert time to dd-MM-YY HH:mm format	  
					}else if(arr[i].toString().endsWith("TIME")) {
						  SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
						  java.util.Date parsedDate = sdf1.parse(rs.getString(arr[i].toString()));
						  SimpleDateFormat print = new SimpleDateFormat("dd-MM-YY HH:mm");
						  arr2[i]= print.format(parsedDate);  //add to the result array
						
					}else {
					//Add rest of the fields as it is. 
						arr2[i]= rs.getString(arr[i].toString()); //add to the result array
					}
					
				}
			
				System.out.format(leftAlignFormat, arr2); //print the values
				
			}

			System.out.format(lineformat+"+%n"); //end line space
			rs.close();  	//close the result set

			cs.close(); 	//close callable statement
			conn.close(); 	//close connection
		} catch (SQLException ex) {
			System.out.println(ANSI_RED +"Exception in View Tables : " + ex.getMessage()+ ANSI_RESET);
			return false;
		} catch (Exception e) {
			System.out.println(ANSI_RED +"Exception in View Tables : " + e.getMessage()+ ANSI_RESET);
			return false;
		}
		return true;
	}


}
