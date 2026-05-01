import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { createWorkPlan } from './actions/plans'
import { Plus, Layout, ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Kullanıcının üye olduğu tüm iş planlarını çek
  const { data: memberships } = await supabase
    .from('work_plan_members')
    .select('*, work_plans(name)')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Yevmiye Takip Sistemi
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Bir iş planı seçin veya yeni bir tane oluşturun.
          </p>
        </div>

        {/* Plan Oluşturma Kartı */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border-2 border-indigo-100 dark:border-indigo-900/30">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Plus className="text-indigo-600" />
            Yeni İş Planı (Şantiye) Oluştur
          </h2>
          <form action={createWorkPlan} className="flex flex-col sm:flex-row gap-4">
            <input 
              name="name" 
              required 
              placeholder="Örn: Merkez Şantiyesi" 
              className="flex-1 rounded-2xl border-gray-200 dark:bg-gray-700 dark:border-gray-600 p-4 text-lg focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
              Hemen Oluştur
            </button>
          </form>
        </div>

        {/* Mevcut Planlar Listesi */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-500 uppercase tracking-widest px-4">
            Mevcut İş Planlarınız
          </h2>
          <div className="grid gap-6">
            {memberships && memberships.length > 0 ? (
              memberships.map((membership: any) => (
                <Link 
                  key={membership.id} 
                  href={membership.role === 'admin' ? `/admin/${membership.plan_id}` : `/worker/${membership.plan_id}`}
                  className="group block"
                >
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl ${membership.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'} dark:bg-gray-700`}>
                        <Layout size={32} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {membership.work_plans.name}
                        </h3>
                        <p className={`text-sm font-bold uppercase tracking-wider ${membership.role === 'admin' ? 'text-indigo-500' : 'text-green-500'}`}>
                          {membership.role === 'admin' ? 'YÖNETİCİ' : 'İŞÇİ'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-2 transition-all" size={32} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-100 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500">Henüz bir iş planınız bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
