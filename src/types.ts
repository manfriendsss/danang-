export interface Activity {
  time: string;
  description: string;
  type?: 'food' | 'transport' | 'visit' | 'accommodation' | 'note';
  costLabel?: string;
  mapLink?: string;
  tollCost?: string;
}

export interface DayPlan {
  date: string;
  title: string;
  distance?: string;
  activities: Activity[];
}

export interface ExpenseItem {
  category: string;
  amount: number;
  note?: string;
}

export interface QuickExpense {
  id: string;
  description: string;
  amount: number;
  payer: string;
  date: string;
}

export interface RecommendationItem {
  name: string;
  mapLink?: string;
}

export interface ItineraryData {
  title: string;
  subtitle: string;
  summary: {
    villaCost: string;
    foodBudget: string;
    totalExpected: string;
  };
  itinerary: DayPlan[];
  expenses: {
    items: ExpenseItem[];
    totalLabel: string;
  };
  quickExpenses?: QuickExpense[];
  adultCount?: number;
  recommendations: {
    title: string;
    categories: {
      name: string;
      items: (string | RecommendationItem)[];
    }[];
  };
  tripStatus?: 'planning' | 'ongoing' | 'finished';
}
