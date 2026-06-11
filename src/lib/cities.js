export const INDIA_CITIES = [
  'Agra','Ahmedabad','Ajmer','Akola','Aligarh','Allahabad','Amravati','Amritsar',
  'Aurangabad','Bangalore','Bareilly','Belgaum','Bhilai','Bhopal','Bhubaneswar',
  'Bikaner','Chandigarh','Chennai','Coimbatore','Cuttack','Dehradun','Delhi',
  'Dhanbad','Durgapur','Erode','Faridabad','Firozabad','Gandhinagar','Ghaziabad',
  'Gorakhpur','Gulbarga','Guntur','Gurugram','Gurgaon','Guwahati','Gwalior',
  'Hamirpur','Hubli','Hyderabad','Indore','Jabalpur','Jaipur','Jalandhar',
  'Jammu','Jamnagar','Jamshedpur','Jodhpur','Kanpur','Kochi','Kolhapur',
  'Kolkata','Kota','Kozhikode','Lucknow','Ludhiana','Madurai','Mangalore',
  'Meerut','Mumbai','Mysuru','Nagpur','Nashik','Navi Mumbai','Noida',
  'Patna','Pune','Raipur','Rajkot','Ranchi','Salem','Shillong','Shimla',
  'Siliguri','Solapur','Srinagar','Surat','Thane','Thiruvananthapuram',
  'Thrissur','Tiruchirappalli','Tiruppur','Udaipur','Vadodara','Varanasi',
  'Vijayawada','Visakhapatnam','Warangal',
]

export function searchCities(query) {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  return INDIA_CITIES
    .filter(c => c.toLowerCase().startsWith(q))
    .slice(0, 8)
}
