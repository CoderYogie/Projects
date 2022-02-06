import java.util.Arrays;
import java.util.HashMap;

public class Solution {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		System.out.println("hi hi mirche");
		
		System.out.println(firstUniqChar("leetcode"));
		
		System.out.println(frequencySort("tree"));
		
		System.out.println(reverse(1534236469));

	}
	
	 public static void merge(int[] nums1, int m, int[] nums2, int n) {
	        for(int i=m, j=0;i<nums1.length;i++,j++){
	            nums1[i]=nums2[j];
	        }
	        
	        Arrays.sort(nums1);
	    }
	 
	 
	public static Integer firstUniqChar(String s) {
			if (s == null || s.trim().length() == 0) {
				return -1;
			} else if (s.trim().length() == 1) {
				return 0;
			}
			HashMap<Character, Integer> map = new HashMap<>();

			for (int i = 0; i < s.length(); i++) {

				map.put(s.charAt(i), map.getOrDefault(s.charAt(i), 0) + 1);

			}

			for (int i = 0; i < s.length(); i++) {
				if (map.get(s.charAt(i)) == 1) {
					return i;
				}
			}

			return -1;
		}

		//Initial Solution worked with worst complexity
		public static String frequencySort(String s) {
			String result = "";
			if (s == null ||  s.isEmpty()) {
				return result;
			}

			HashMap<Character, Integer> map = new HashMap<>();
			for (int i = 0; i < s.length(); i++) {
				map.put(s.charAt(i), map.getOrDefault(s.charAt(i), 0) + 1);
			}

			while (!map.isEmpty()) {
				Integer max = map.getOrDefault(s.charAt(0), 0);
				Character key = s.charAt(0);

				for (int i = 0; i < s.length(); i++) {
					if (map.getOrDefault(s.charAt(i), 0) > max) {
						max = map.get(s.charAt(i));
						key = s.charAt(i);
					}
				}

				while (max != 0) {
					result += key;
					max--;
				}

				map.remove(key);

			}

			return result;
		}
		
		public static int reverse(int x) {
	        int result = 0;
	        
	        while(x!=0){
	            
	            int digit = x % 10;
	            result = result * 10 + digit;
	            x=x/10;
	            
	            if(result  > Integer.MAX_VALUE/10 || result < Integer.MIN_VALUE/10){
		            return 0;
		        }
	        }
	        
	       
	            return result;
	        
	        
	    }
}
