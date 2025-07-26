import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Download, Eye, CreditCard, Smartphone, Building2, TrendingUp, Plus } from 'lucide-react';

// Define validation schema for wallet recharge
const walletRechargeSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  paymentMethod: z.enum(["upi", "card", "netbanking"]),
});

// Define the type for form data
type WalletRechargeFormData = z.infer<typeof walletRechargeSchema>;

export interface Earnings {
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  pendingAmount: number;
  completedTrips: number;
  totalTrips: number;
  averageRating: number;
}

interface WalletTabProps {
  earnings: Earnings | null;
  isLoading: boolean;
}

export const WalletTab = ({ earnings, isLoading }: WalletTabProps) => {
  const { toast } = useToast();

  // Wallet recharge form
  const walletRechargeForm = useForm<WalletRechargeFormData>({
    resolver: zodResolver(walletRechargeSchema),
    defaultValues: {
      amount: "",
      paymentMethod: "upi" as const,
    },
  });

  // Quick recharge amounts
  const quickAmounts = [100, 250, 500, 1000, 2000];

  // Handle wallet recharge submission
  const onWalletRechargeSubmit = (data: WalletRechargeFormData) => {
    console.log("Wallet Recharge Data:", data);
    
    // TODO: Implement actual wallet recharge API call
    toast({
      title: "Wallet Recharge Requested! 💰",
      description: `₹${data.amount} recharge request submitted successfully`,
    });
    
    walletRechargeForm.reset();
  };

  // Handle quick amount selection
  const handleQuickAmount = (amount: number) => {
    walletRechargeForm.setValue('amount', amount.toString());
  };

  // Payment method icons
  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'upi':
        return <Smartphone className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'netbanking':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-100 border-l-4 border-l-blue-500">
          <CardContent className="p-4 sm:p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-blue-200 rounded w-1/4 mb-2"></div>
              <div className="h-8 bg-blue-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Balance Card */}
      <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-100 border-l-4 border-l-blue-500">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-medium text-gray-600 mb-1">Current Balance</h3>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">₹{earnings?.totalEarnings?.toLocaleString() || '0'}</p>
                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700 border-green-200">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Available
                </Badge>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none justify-center">
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Withdraw</span>
                <span className="sm:hidden">Withdraw</span>
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none justify-center">
                <Eye className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Transactions</span>
                <span className="sm:hidden">History</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">₹{earnings?.todayEarnings?.toLocaleString() || '0'}</div>
            <div className="text-sm text-gray-600">Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">₹{earnings?.weeklyEarnings?.toLocaleString() || '0'}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">₹{earnings?.monthlyEarnings?.toLocaleString() || '0'}</div>
            <div className="text-sm text-gray-600">This Month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">₹{earnings?.pendingAmount?.toLocaleString() || '0'}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Recharge Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Plus className="h-5 w-5 text-blue-600" />
            <span>Recharge Wallet</span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Add money to your wallet for seamless transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Amount Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Quick Select Amount</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(amount)}
                  className="h-10 sm:h-12 text-xs sm:text-sm font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                >
                  ₹{amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Recharge Form */}
          <Form {...walletRechargeForm}>
            <form onSubmit={walletRechargeForm.handleSubmit(onWalletRechargeSubmit)} className="space-y-4 sm:space-y-6">
              <FormField
                control={walletRechargeForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-medium">Custom Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 font-medium">₹</span>
                        </div>
                        <Input 
                          placeholder="Enter amount" 
                          className="pl-8 h-11 sm:h-12 text-base" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={walletRechargeForm.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-medium">Payment Method</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 sm:h-12">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                        <SelectItem value="upi" className="py-3">
                          <div className="flex items-center space-x-3">
                            <Smartphone className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="font-medium">UPI</div>
                              <div className="text-xs text-gray-500">GPay, PhonePe, Paytm</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="card" className="py-3">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="font-medium">Debit/Credit Card</div>
                              <div className="text-xs text-gray-500">Visa, Mastercard, RuPay</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="netbanking" className="py-3">
                          <div className="flex items-center space-x-3">
                            <Building2 className="h-4 w-4 text-purple-600" />
                            <div>
                              <div className="font-medium">Net Banking</div>
                              <div className="text-xs text-gray-500">All major banks</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full h-11 sm:h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {getPaymentIcon(walletRechargeForm.watch('paymentMethod'))}
                <span className="ml-2">Recharge Wallet</span>
              </Button>
            </form>
          </Form>

          {/* Security Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Secure Payments</h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  All transactions are encrypted and secured. Your payment information is safe with us.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Your latest wallet transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {/* Mock recent transactions */}
            {[
              { type: 'credit', amount: 500, desc: 'Trip earnings - TR-1001', time: '2 hours ago' },
              { type: 'credit', amount: 350, desc: 'Trip earnings - TR-1002', time: '1 day ago' },
              { type: 'debit', amount: 200, desc: 'Fuel recharge', time: '2 days ago' },
            ].map((transaction, index) => (
              <div key={index} className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <TrendingUp className={`h-4 w-4 sm:h-5 sm:w-5 text-green-600`} />
                    ) : (
                      <Download className={`h-4 w-4 sm:h-5 sm:w-5 text-red-600`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                      {transaction.desc}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">{transaction.time}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm sm:text-base font-bold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4 sm:mt-6">
            <Eye className="mr-2 h-4 w-4" />
            View All Transactions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
