import { NextRequest, NextResponse } from 'next/server';
import { departmentService } from '@/backend_lib/modules/core/composition-root';

export async function POST(request: NextRequest) {
  const { name, parentId } = await request.json();

  try {
    const department = await departmentService.createDepartment({ name, parentId });
    return NextResponse.json({
      id: department.id,
      name: department.name.value,
      parentId: department.parentId,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
