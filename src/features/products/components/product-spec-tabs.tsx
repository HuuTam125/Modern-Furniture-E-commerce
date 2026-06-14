// src/features/products/components/product-spec-tabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { ProductWithDetails } from '@/types/product'

interface ProductSpecTabsProps {
  product: ProductWithDetails
}

export function ProductSpecTabs({ product }: ProductSpecTabsProps) {
  const { spec } = product
  return (
    <Tabs>
      <TabsList className="h-auto w-full justify-start border-b bg-transparent p-0">
        {['description', 'specs', 'care', 'policy'].map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent"
          >
            {tab === 'description' && 'Mô tả'}
            {tab === 'specs' && 'Thông số kỹ thuật'}
            {tab === 'care' && 'Hướng dẫn bảo quản'}
            {tab === 'policy' && 'Chính sách'}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent
        value="description"
        className="prose prose-sm mt-4 max-w-none"
      >
        <div dangerouslySetInnerHTML={{ __html: product.description }} />
      </TabsContent>

      <TabsContent value="specs" className="mt-4">
        {spec ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                label: 'Chiều rộng',
                value: spec.widthCm ? `${spec.widthCm} cm` : null,
              },
              {
                label: 'Chiều sâu',
                value: spec.depthCm ? `${spec.depthCm} cm` : null,
              },
              {
                label: 'Chiều cao',
                value: spec.heightCm ? `${spec.heightCm} cm` : null,
              },
              {
                label: 'Trọng lượng',
                value: spec.weightKg ? `${spec.weightKg} kg` : null,
              },
              { label: 'Chất liệu chính', value: spec.primaryMaterial },
              { label: 'Chất liệu phụ', value: spec.secondaryMaterial },
              { label: 'Xuất xứ', value: spec.origin },
              { label: 'Thời gian lắp ráp', value: spec.assemblyTime },
              {
                label: 'Yêu cầu lắp ráp',
                value: spec.assemblyRequired ? 'Có' : 'Không',
              },
              { label: 'Bảo hành', value: spec.warrantyInfo },
            ]
              .filter((item) => item.value)
              .map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between rounded-lg bg-gray-50 px-4 py-2.5"
                >
                  <span className="text-muted-foreground text-sm">
                    {item.label}
                  </span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Chưa có thông số kỹ thuật
          </p>
        )}
      </TabsContent>

      <TabsContent value="care" className="mt-4">
        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
          {spec?.careInstructions ?? 'Vui lòng liên hệ để biết thêm thông tin.'}
        </p>
      </TabsContent>

      <TabsContent value="policy" className="mt-4">
        <Accordion type="multiple" className="w-full">
          {[
            {
              value: 'return',
              title: 'Chính sách đổi trả',
              content:
                'Đổi trả trong 30 ngày nếu sản phẩm lỗi từ nhà sản xuất. Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng.',
            },
            {
              value: 'warranty',
              title: 'Bảo hành',
              content:
                spec?.warrantyInfo ??
                'Vui lòng xem thông số kỹ thuật để biết thông tin bảo hành.',
            },
            {
              value: 'shipping',
              title: 'Vận chuyển',
              content:
                'Giao hàng toàn quốc. Miễn phí vận chuyển cho đơn hàng từ 5.000.000đ. Thời gian giao hàng từ 3–7 ngày làm việc.',
            },
          ].map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger className="text-sm font-medium">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </TabsContent>
    </Tabs>
  )
}
