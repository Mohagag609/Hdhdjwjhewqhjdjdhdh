import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'

type PartnerRow = { partnerId?: number; partnerName: string; percentage: number }
type Phase = { id: number; name: string; plannedAmount?: number }
type MaterialItem = { id: number; name: string; quantity: number; unit?: string; unitPrice: number; total: number; supplier: { id: number; name: string } }

export default function ProjectPage() {
  const { id } = useParams()
  const projectId = Number(id)
  const [project, setProject] = useState<any>(null)
  const [balance, setBalance] = useState<number>(0)
  const [tab, setTab] = useState<'partners' | 'phases' | 'materials' | 'treasury' | 'settlement' | 'reports'>('partners')
  const [error, setError] = useState<string>('')

  // partners state
  const [partnerRows, setPartnerRows] = useState<PartnerRow[]>([])

  // phases
  const phases: Phase[] = useMemo(() => (project?.phases ?? []) as Phase[], [project])
  const [newPhaseName, setNewPhaseName] = useState('')
  const [newPhaseAmount, setNewPhaseAmount] = useState<number | ''>('')

  // materials
  const [materialsPhaseId, setMaterialsPhaseId] = useState<number | ''>('')
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [matSupplierName, setMatSupplierName] = useState('')
  const [matName, setMatName] = useState('')
  const [matQty, setMatQty] = useState<number | ''>('')
  const [matUnit, setMatUnit] = useState('')
  const [matUnitPrice, setMatUnitPrice] = useState<number | ''>('')

  // treasury
  const [transactions, setTransactions] = useState<any[]>([])
  const [receiptPartnerName, setReceiptPartnerName] = useState('')
  const [receiptAmount, setReceiptAmount] = useState<number | ''>('')
  const [paymentSupplierName, setPaymentSupplierName] = useState('')
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('')
  const [paymentPhaseId, setPaymentPhaseId] = useState<number | ''>('')

  // settlement
  const [settlementPhaseId, setSettlementPhaseId] = useState<number | ''>('')
  const [settlementRows, setSettlementRows] = useState<any[]>([])

  // reports
  const [treasurySummary, setTreasurySummary] = useState<{incoming:number; outgoing:number; balance:number} | null>(null)
  const [reportPhaseId, setReportPhaseId] = useState<number | ''>('')
  const [suppliersReport, setSuppliersReport] = useState<Array<{supplierId:number|null; supplierName:string|null; paid:number}>>([])

  const refreshProject = async () => {
    const res = await api.get(`/projects/${projectId}`)
    setProject(res.data)
    // seed partner rows from response
    const pp = (res.data.partners || []).map((r: any) => ({ partnerId: r.partnerId, partnerName: r.partner.name, percentage: Number(r.percentage) }))
    if (pp.length) setPartnerRows(pp)
  }

  const refreshBalance = async () => {
    const res = await api.get(`/projects/${projectId}/treasury/balance`)
    setBalance(res.data.treasuryBalance)
  }

  const refreshTreasurySummary = async () => {
    const res = await api.get(`/projects/${projectId}/reports/treasury`)
    setTreasurySummary(res.data)
  }

  const refreshTransactions = async () => {
    const res = await api.get(`/projects/${projectId}/treasury/transactions`)
    setTransactions(res.data)
  }

  useEffect(() => {
    if (!projectId) return
    setError('')
    Promise.all([refreshProject(), refreshBalance(), refreshTransactions(), refreshTreasurySummary()]).catch((e) => setError(String(e)))
  }, [projectId])

  // partners tab handlers
  const addPartnerRow = () => setPartnerRows([...partnerRows, { partnerName: '', percentage: 0 }])
  const removePartnerRow = (idx: number) => setPartnerRows(partnerRows.filter((_, i) => i !== idx))
  const savePartners = async () => {
    setError('')
    const total = partnerRows.reduce((s, r) => s + Number(r.percentage || 0), 0)
    if (Math.abs(total - 100) > 0.01) {
      setError('إجمالي النسب يجب أن يساوي 100')
      return
    }
    await api.post(`/projects/${projectId}/partners`, partnerRows.map(r => ({ name: r.partnerName, percentage: Number(r.percentage) })))
    await refreshProject()
  }

  // phases tab handlers
  const createPhase = async () => {
    if (!newPhaseName.trim()) return
    await api.post(`/projects/${projectId}/phases`, { name: newPhaseName, plannedAmount: newPhaseAmount === '' ? undefined : Number(newPhaseAmount) })
    setNewPhaseName('')
    setNewPhaseAmount('')
    await refreshProject()
  }

  const refreshMaterials = async () => {
    if (!materialsPhaseId) return
    const res = await api.get(`/projects/${projectId}/phases/${materialsPhaseId}/materials`)
    setMaterials(res.data)
  }

  useEffect(() => {
    if (materialsPhaseId) refreshMaterials().catch((e) => setError(String(e)))
  }, [materialsPhaseId])

  const addMaterial = async () => {
    if (!materialsPhaseId) return
    if (!matSupplierName.trim() || !matName.trim() || matQty === '' || matUnitPrice === '') return
    await api.post(`/projects/${projectId}/phases/${materialsPhaseId}/materials`, {
      supplierName: matSupplierName,
      name: matName,
      quantity: Number(matQty),
      unit: matUnit || undefined,
      unitPrice: Number(matUnitPrice),
    })
    setMatSupplierName(''); setMatName(''); setMatQty(''); setMatUnit(''); setMatUnitPrice('')
    await refreshMaterials()
  }

  // treasury
  const submitReceipt = async () => {
    if (!receiptPartnerName.trim() || receiptAmount === '') return
    await api.post(`/projects/${projectId}/treasury/receipts`, { partnerName: receiptPartnerName, amount: Number(receiptAmount) })
    setReceiptPartnerName(''); setReceiptAmount('')
    await Promise.all([refreshBalance(), refreshTransactions()])
  }
  const submitPayment = async () => {
    if (!paymentSupplierName.trim() || paymentAmount === '') return
    await api.post(`/projects/${projectId}/treasury/payments`, { supplierName: paymentSupplierName, amount: Number(paymentAmount), phaseId: paymentPhaseId === '' ? undefined : Number(paymentPhaseId) })
    setPaymentSupplierName(''); setPaymentAmount(''); setPaymentPhaseId('')
    await Promise.all([refreshBalance(), refreshTransactions()])
  }

  // settlement
  const runSettlement = async () => {
    if (!settlementPhaseId) return
    await api.post(`/projects/${projectId}/settlements/run`, { phaseId: settlementPhaseId })
    const res = await api.get(`/projects/${projectId}/settlements/${settlementPhaseId}`)
    setSettlementRows(res.data)
  }

  // reports
  const loadSuppliersReport = async () => {
    const res = await api.get(`/projects/${projectId}/reports/suppliers`, { params: { phaseId: reportPhaseId || undefined } })
    setSuppliersReport(res.data)
  }

  return (
    <div className="container">
      <h2>مشروع #{projectId} {project?.name ? `- ${project.name}` : ''}</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <div className="row">
        <strong>رصيد الخزينة:</strong>&nbsp;{balance.toLocaleString()}
      </div>
      <div className="tabs">
        {(['partners','phases','materials','treasury','settlement','reports'] as const).map(t => (
          <button key={t} className={tab===t? 'active':''} onClick={() => setTab(t)}>{
            t==='partners'?'الشركاء': t==='phases'?'المراحل': t==='materials'?'البنود': t==='treasury'?'الخزينة': t==='settlement'?'التسوية':'التقارير'
          }</button>
        ))}
      </div>

      {tab==='partners' && (
        <div>
          <h3>الشركاء ونِسبهم</h3>
          <table>
            <thead><tr><th>الاسم</th><th>النسبة %</th><th></th></tr></thead>
            <tbody>
              {partnerRows.map((r, idx) => (
                <tr key={idx}>
                  <td><input value={r.partnerName} onChange={e => {
                    const v = [...partnerRows]; v[idx].partnerName = e.target.value; setPartnerRows(v)
                  }} /></td>
                  <td><input type="number" value={r.percentage} onChange={e => {
                    const v = [...partnerRows]; v[idx].percentage = Number(e.target.value); setPartnerRows(v)
                  }} /></td>
                  <td><button onClick={() => removePartnerRow(idx)}>حذف</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="row">
            <button onClick={addPartnerRow}>+ شريك</button>
            <button onClick={savePartners}>حفظ النسب</button>
            <div>الإجمالي: {partnerRows.reduce((s,r)=>s+Number(r.percentage||0),0)}%</div>
          </div>
        </div>
      )}

      {tab==='phases' && (
        <div>
          <h3>المراحل</h3>
          <ul>
            {phases.map(ph => (
              <li key={ph.id}>{ph.name} {ph.plannedAmount!=null? `(مخطط: ${ph.plannedAmount})`: ''}</li>
            ))}
          </ul>
          <div className="row">
            <input placeholder="اسم المرحلة" value={newPhaseName} onChange={e=>setNewPhaseName(e.target.value)} />
            <input placeholder="مبلغ مخطط" type="number" value={newPhaseAmount} onChange={e=>setNewPhaseAmount(e.target.value===''? '': Number(e.target.value))} />
            <button onClick={createPhase}>إضافة مرحلة</button>
          </div>
        </div>
      )}

      {tab==='materials' && (
        <div>
          <h3>بنود المواد</h3>
          <div className="row">
            <select value={materialsPhaseId} onChange={e=>setMaterialsPhaseId(e.target.value===''? '': Number(e.target.value))}>
              <option value="">اختر مرحلة</option>
              {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={refreshMaterials}>تحديث</button>
          </div>
          {materialsPhaseId && (
            <>
              <table>
                <thead><tr><th>المورد</th><th>البند</th><th>الكمية</th><th>الوحدة</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead>
                <tbody>
                  {materials.map(m => (
                    <tr key={m.id}>
                      <td>{m.supplier?.name}</td>
                      <td>{m.name}</td>
                      <td>{m.quantity}</td>
                      <td>{m.unit||''}</td>
                      <td>{m.unitPrice}</td>
                      <td>{m.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="row">
                <input placeholder="اسم المورد" value={matSupplierName} onChange={e=>setMatSupplierName(e.target.value)} />
                <input placeholder="البند" value={matName} onChange={e=>setMatName(e.target.value)} />
                <input placeholder="الكمية" type="number" value={matQty} onChange={e=>setMatQty(e.target.value===''? '': Number(e.target.value))} />
                <input placeholder="الوحدة (اختياري)" value={matUnit} onChange={e=>setMatUnit(e.target.value)} />
                <input placeholder="سعر الوحدة" type="number" value={matUnitPrice} onChange={e=>setMatUnitPrice(e.target.value===''? '': Number(e.target.value))} />
                <button onClick={addMaterial}>إضافة بند</button>
              </div>
            </>
          )}
        </div>
      )}

      {tab==='treasury' && (
        <div>
          <h3>الخزينة</h3>
          <div className="row">
            <strong>الرصيد:</strong>&nbsp;{balance.toLocaleString()}
          </div>
          <h4>قبض من شريك</h4>
          <div className="row">
            <input placeholder="اسم الشريك" value={receiptPartnerName} onChange={e=>setReceiptPartnerName(e.target.value)} />
            <input placeholder="المبلغ" type="number" value={receiptAmount} onChange={e=>setReceiptAmount(e.target.value===''? '': Number(e.target.value))} />
            <button onClick={submitReceipt}>قبض</button>
          </div>
          <h4>صرف لمورد</h4>
          <div className="row">
            <input placeholder="اسم المورد" value={paymentSupplierName} onChange={e=>setPaymentSupplierName(e.target.value)} />
            <input placeholder="المبلغ" type="number" value={paymentAmount} onChange={e=>setPaymentAmount(e.target.value===''? '': Number(e.target.value))} />
            <select value={paymentPhaseId} onChange={e=>setPaymentPhaseId(e.target.value===''? '': Number(e.target.value))}>
              <option value="">مرحلة (اختياري)</option>
              {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={submitPayment}>صرف</button>
          </div>
          <h4>الحركات</h4>
          <table>
            <thead><tr><th>تاريخ</th><th>اتجاه</th><th>المبلغ</th><th>شريك</th><th>مورد</th><th>مرحلة</th></tr></thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={i}>
                  <td>{t.txDate?.substring?.(0,10) || ''}</td>
                  <td>{t.direction}</td>
                  <td>{Number(t.amount)}</td>
                  <td>{t.partner?.name || ''}</td>
                  <td>{t.supplier?.name || ''}</td>
                  <td>{t.phase?.name || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='settlement' && (
        <div>
          <h3>التسوية</h3>
          <div className="row">
            <select value={settlementPhaseId} onChange={e=>setSettlementPhaseId(e.target.value===''? '': Number(e.target.value))}>
              <option value="">اختر مرحلة</option>
              {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={runSettlement}>تشغيل التسوية</button>
          </div>
          <table>
            <thead><tr><th>الشريك</th><th>المستحق</th><th>المدفوع</th><th>الفارق</th><th>الحالة</th></tr></thead>
            <tbody>
              {settlementRows.map((r, i) => (
                <tr key={i}>
                  <td>{r.partnerName}</td>
                  <td>{r.amountDue}</td>
                  <td>{r.amountPaidToDate}</td>
                  <td>{r.delta}</td>
                  <td>{r.settlementStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='reports' && (
        <div>
          <h3>التقارير</h3>
          <div className="row">
            <strong>ملخص الخزينة:</strong>
            <span>وارد: {treasurySummary?.incoming ?? 0}</span>
            <span>مصروف: {treasurySummary?.outgoing ?? 0}</span>
            <span>الرصيد: {treasurySummary?.balance ?? 0}</span>
            <button onClick={refreshTreasurySummary}>تحديث</button>
          </div>
          <h4>دفعات الموردين حسب المرحلة</h4>
          <div className="row">
            <select value={reportPhaseId} onChange={e=>setReportPhaseId(e.target.value===''? '': Number(e.target.value))}>
              <option value="">كل المراحل</option>
              {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={loadSuppliersReport}>عرض التقرير</button>
          </div>
          <table>
            <thead><tr><th>المورد</th><th>المدفوع</th></tr></thead>
            <tbody>
              {suppliersReport.map((r, i) => (
                <tr key={i}>
                  <td>{r.supplierName ?? 'غير محدد'}</td>
                  <td>{r.paid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .container { max-width: 900px; margin: 0 auto; padding: 16px; }
        .row { display: flex; gap: 8px; align-items: center; margin: 8px 0; flex-wrap: wrap; }
        .tabs { display: flex; gap: 8px; margin: 12px 0; }
        .tabs button.active { background: #1976d2; color: white; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: start; }
        nav.nav { display:flex; gap:12px; padding:8px 0; }
        input, select, button { padding: 6px 8px; }
      `}</style>
    </div>
  )
}

